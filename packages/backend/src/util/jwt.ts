//packages/backend/src/util/jwt.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import { rdc } from '../db/redis/redis.db';

// Define the JWT payload interface
interface JwtPayload {
  uid: string;          // User ID
  role: string;         // User role (e.g., "user", "admin")
  iat?: number;         // Issued at (automatically added by jwt.sign)
  exp?: number;         // Expiration (automatically added by jwt.sign)
  iss?: string;         // Issuer (optional)
  aud?: string;         // Audience (optional)
}

// Configuration constants
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || randomBytes(32).toString('hex'); // 256-bit random key if not provided
const JWT_EXPIRATION = '15m' as const; // Short-lived tokens
const ISSUER: string = 'uni-pi-games-platform'; // Unique issuer identifier
const AUDIENCE: string = 'uni-pi-users'; // Audience identifier

/**
 * Signs a JWT with the provided payload
 * @param payload The data to encode in the token
 * @returns Signed JWT string
 */
export function signToken(payload: JwtPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: JWT_EXPIRATION,
    algorithm: 'HS256',
    issuer: ISSUER,
    audience: AUDIENCE,
  };
  return jwt.sign(payload, JWT_SECRET, options);
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
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
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
 * Middleware to authenticate requests using JWT
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
 * Generates a refresh token
 * @param uid User ID
 * @returns Refresh token string
 */
export function generateRefreshToken(uid: string): string {
  const refreshPayload: { uid: string } = { uid };
  return jwt.sign(refreshPayload, JWT_SECRET + '-refresh', { // Use a different secret for refresh tokens
    expiresIn: '7d', // Longer-lived refresh token
  });
}

/**
 * Verifies a refresh token
 * @param token Refresh token string
 * @returns User ID or null if invalid
 */
export function verifyRefreshToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET + '-refresh') as { uid: string };
    return decoded.uid;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Refresh token verification failed:', errorMessage);
    return null;
  }
}
// Example usage in a route (pseudo-code)
/*
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Authenticate user...
  const user = { uid: 'user123', role: 'user' };
  const accessToken = signToken(user);
  const refreshToken = generateRefreshToken(user.uid);

  // Set access token in HTTP-only, Secure cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: true, // Requires HTTPS
    sameSite: 'strict', // Prevents CSRF
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.json({ refreshToken });
});

app.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const uid = verifyRefreshToken(refreshToken);
  if (!uid) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  const user = { uid, role: 'user' }; // Fetch role from DB in real app
  const newAccessToken = signToken(user);
  res.cookie('token', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
  res.json({ message: 'Token refreshed' });
});

app.post('/logout', (req, res) => {
  const token = req.cookies.token;
  if (token) revokeToken(token);
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected data', user: req.user });
});
*/