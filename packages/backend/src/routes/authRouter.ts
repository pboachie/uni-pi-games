// packages/backend/src/routes/authRouter.ts
import express, { Request, Response } from 'express';
import { pi } from '../services/piService'; // Pi Network SDK integration
import { asyncHandler } from '../middleware/asyncHandler';
import { upsertUser } from '../services/userService';
import logger from '../util/logger';
import { pgPool } from '../db/postgres/postgres.db';
import { signToken, generateRefreshToken, verifyRefreshToken } from '../util/jwt';
import { CookieOptions } from 'express';
import { log } from 'console';

const authRouter = express.Router();

const isProd = process.env.NODE_ENV === 'production';
// Set domain: in production allow sandbox.minepi.com; in development, use localhost (or omit as needed)
const domain = isProd ? '.unipigames.com' : 'localhost';
logger.debug(`Using domain: ${domain}`);
logger.debug(`isProd: ${isProd}`);
// Cookie options for access and refresh tokens
const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd ? false : true,
  sameSite: 'none', // Allow cross‑site requests
  maxAge: 15 * 60 * 1000, // 15 minutes
  domain,
};

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd ? false : true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  domain,
};

/**
 * POST /signin
 * Handles user sign-in and sets tokens in HTTP-only cookies
 */
authRouter.post(
  '/signin',
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug('Received signin request');
    const { accessToken, user: userPayload } = req.body.authResult || {};
    if (!userPayload || !userPayload.uid || !accessToken) {
      logger.warn('Missing user information or access token in request body');
      return res.status(400).json({ error: 'Missing user information or access token' });
    }
    const piUserId = userPayload.uid;
    logger.debug(`Verifying user with piUserId: ${piUserId}`);

    // Verify user with Pi Network SDK (assumed to return user object or null)
    const user = await (pi as any).verifyUser(piUserId, accessToken);
    if (!user) {
      logger.warn(`Invalid credentials for piUserId: ${piUserId}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Upsert user into the database
    logger.debug(`Upserting user: ${user.uid}`);
    await upsertUser(user);

    // Generate access and refresh tokens
    const token = signToken({
      uid: user.uid,
      role: 'user',
      scopes: user.scopes || [],
      username: user.username,
    });
    const refreshToken = generateRefreshToken(user.uid);

    // Store refresh token in the database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pgPool.query(
      'INSERT INTO refresh_tokens (uid, token, expires_at) VALUES ($1, $2, $3)',
      [user.uid, refreshToken, expiresAt]
    );

    // Set cookies
    res.cookie('token', token, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    logger.info(`User signed in successfully: ${user.uid} (${user.username})`);
    return res.status(200).json({ message: 'Signed in successfully' });
  })
);

/**
 * POST /refresh
 * Refreshes the access token using the refresh token from the cookie
 */
authRouter.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug('Received refresh token request');

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      logger.warn('No refresh token provided');
      return res.status(400).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token
    let uid: string | null;
    try {
      uid = verifyRefreshToken(refreshToken);
    } catch (err) {
      logger.warn('Invalid refresh token signature or expired');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if uid is null (invalid refresh token)
    if (!uid) {
      logger.warn('Invalid refresh token');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if refresh token exists in the database and is not expired
    const result = await pgPool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND uid = $2',
      [refreshToken, uid]
    );
    if (result.rowCount === 0) {
      logger.warn('Refresh token not found in database');
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const tokenRecord = result.rows[0];
    if (new Date(tokenRecord.expires_at) < new Date()) {
      logger.warn('Refresh token expired');
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Generate new access and refresh tokens
    const newAccessToken = signToken({ uid, role: 'user' });
    const newRefreshToken = generateRefreshToken(uid);

    // Update database: remove old refresh token, add new one
    await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await pgPool.query(
      'INSERT INTO refresh_tokens (uid, token, expires_at) VALUES ($1, $2, $3)',
      [uid, newRefreshToken, newExpiresAt]
    );

    // Set new cookies
    res.cookie('token', newAccessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    logger.info(`Token refreshed successfully for uid: ${uid}`);
    return res.status(200).json({ message: 'Token refreshed successfully' });
  })
);

/**
 * POST /logout
 * Logs out the user by clearing cookies and invalidating the refresh token
 */
authRouter.post(
  '/logout',
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug('Received logout request');

    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      // Remove refresh token from database
      await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      logger.debug('Refresh token deleted from database');
    }

    // Clear cookies
    res.clearCookie('token', accessTokenCookieOptions);
    res.clearCookie('refreshToken', refreshTokenCookieOptions);

    logger.info('User logged out, tokens cleared');
    return res.status(200).json({ message: 'Logged out successfully' });
  })
);

export default authRouter;