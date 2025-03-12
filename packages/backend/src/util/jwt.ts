//packages/backend/src/util/jwt.ts
import jwt from 'jsonwebtoken';
import { cfg, prod } from '../util/env';
import { Request, Response, NextFunction } from 'express';
import { randomBytes, generateKeyPairSync } from 'crypto';
import { rdc } from '../db/redis/redis.db';

// Generate an EC key pair using the secp521r1 curve (recommended for ES512)
// If environment variables are set, they will be used instead.
const ecKeyPair = generateKeyPairSync('ec', {
  namedCurve: 'secp521r1',
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

const JWT_PRIVATE_KEY: jwt.Secret = cfg.jwt.privateKey || ecKeyPair.privateKey;
const JWT_PUBLIC_KEY: jwt.Secret = cfg.jwt.publicKey || ecKeyPair.publicKey;

const JWT_EXPIRATION = cfg.jwt.expiration; // Short-lived tokens
const ISSUER: string = cfg.jwt.issuer; // Unique issuer identifier
const AUDIENCE: string = cfg.jwt.audience; // Audience identifier

// Define the JWT payload interface
interface JwtPayload {
  uid: string;          // User ID
  role: string;         // User role (e.g., "user", "admin")
  scopes?: string[];    // User scopes (optional)
  iat?: number;         // Issued at (automatically added by jwt.sign)
  exp?: number;         // Expiration (automatically added by jwt.sign)
  iss?: string;         // Issuer (optional)
  aud?: string;         // Audience (optional)
  username?: string;    // Username (optional)
}

/**
 * Signs a JWT with the provided payload using ES512.
 * @param payload The data to encode in the token
 * @returns Signed JWT string
 */
export function signToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRATION as any,
    algorithm: 'ES512',
    issuer: ISSUER,
    audience: AUDIENCE,
  };
  return jwt.sign(payload, JWT_PRIVATE_KEY, options);
}

/**
 * Asynchronously verifies and decodes a JWT, checking the Redis blacklist.
 * @param token The JWT string to verify
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const isRevoked = await rdc.get(`revoked:${token}`);
    if (isRevoked) {
      console.warn('Attempt to use revoked token');
      return null;
    }
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
      algorithms: ['ES512'],
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as JwtPayload;
    return decoded;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('JWT verification failed:', errorMessage);
    return null;
  }
}

/**
 * Middleware to authenticate requests using JWT.
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token: string | undefined = req.cookies?.token || req.headers.authorization?.split(' ')[1]; // Support cookies or Authorization header

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const decoded: JwtPayload | null = await verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or revoked token' });
    return;
  }

  // Attach decoded payload to request with proper typing
  (req as Request & { user?: JwtPayload }).user = decoded;
  next();
}

/**
 * Asynchronously revokes a token by storing it in Redis.
 * @param token The JWT to revoke
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    const exp = decoded?.exp;
    // Calculate expiry time in seconds; default to 900 seconds if not present
    const expiresIn = exp ? exp - Math.floor(Date.now() / 1000) : 900;
    await rdc.set(`revoked:${token}`, 'true', { EX: expiresIn });
    console.log('Token revoked:', token);
  } catch (err) {
    console.error('Error revoking token:', err);
  }
}

/**
 * Generates a refresh token using ES512.
 * @param uid User ID
 * @returns Refresh token string
 */
export function generateRefreshToken(uid: string): string {
  const refreshPayload: { uid: string } = { uid };
  return jwt.sign(refreshPayload, JWT_PRIVATE_KEY, {
    algorithm: 'ES512',
    expiresIn: '1d', // Longer-lived refresh token
  });
}

/**
 * Verifies a refresh token.
 * @param token Refresh token string
 * @returns User ID or null if invalid
 */
export function verifyRefreshToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['ES512'] }) as { uid: string };
    return decoded.uid;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Refresh token verification failed:', errorMessage);
    return null;
  }
}