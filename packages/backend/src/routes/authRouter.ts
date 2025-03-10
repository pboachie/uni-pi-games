// src/routes/authRouter.ts
import express, { Request, Response, NextFunction } from 'express';
import { pi } from '../services/piService'; // Pi Network SDK integration
import { asyncHandler } from '../middleware/asyncHandler';
import { upsertUser } from '../services/userService';
import logger from '../util/logger';
import { pgPool } from '../db/postgres/postgres.db';
import { signToken, generateRefreshToken, verifyRefreshToken } from '../util/jwt';

const authRouter = express.Router();

authRouter.post(
  '/signin',
  asyncHandler(async (req: Request, res: Response) => {
    logger.debug('Received signin request');
    const { piUserId, accessToken } = req.body;
    logger.debug(`Verifying user with piUserId: ${piUserId}`);

    // Verify user with Pi Network SDK
    const user = await (pi as any).verifyUser(piUserId, accessToken);
    if (!user) {
      logger.warn(`Invalid credentials for piUserId: ${piUserId}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Upsert user into DB to track created and last login times
    logger.debug(`Upserting user: ${user.uid}`);
    await upsertUser(user);

    // Include scopes from the user object in the token payload
    const token = signToken({
      uid: user.uid,
      role: 'user',
      scopes: user.scopes || []
    });
    logger.info(`User signed in successfully: ${user.uid}`);
    return res.status(200).json({ token });
  })
);

authRouter.post('/refresh', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
      logger.debug('Received refresh token request');
      const { refreshToken } = req.body;
      if (!refreshToken) {
          logger.warn('No refresh token provided');
          return res.status(400).json({ error: 'No refresh token provided' });
      }
      // Verify refresh token using JWT utility
      const uid = verifyRefreshToken(refreshToken);
      if (!uid) {
          logger.warn('Invalid refresh token');
          return res.status(401).json({ error: 'Invalid refresh token' });
      }
      // Check if refresh token exists in DB and is not expired
      const result = await pgPool.query(
          'SELECT * FROM refresh_tokens WHERE token = $1 AND uid = $2',
          [refreshToken, uid]
      );
      if (result.rowCount === 0) {
          logger.warn('Refresh token not recognized in database');
          return res.status(401).json({ error: 'Refresh token not recognized' });
      }
      const tokenRecord = result.rows[0];
      const now = new Date();
      if (new Date(tokenRecord.expires_at) < now) {
          logger.warn('Refresh token expired');
          return res.status(401).json({ error: 'Refresh token expired' });
      }
      // Generate new tokens
      const newAccessToken = signToken({ uid, role: 'user' });
      const newRefreshToken = generateRefreshToken(uid);
      // Define new expiration (e.g., 7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      // Insert new refresh token and remove the old one
      await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
      await pgPool.query(
          'INSERT INTO refresh_tokens (uid, token, expires_at) VALUES ($1, $2, $3)',
          [uid, newRefreshToken, expiresAt]
      );
      logger.info(`Refresh token rotated successfully for uid: ${uid}`);
      // Return new tokens
      res.status(200).json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
      });
  } catch (err) {
      logger.error(`Refresh token error: ${err}`);
      next(err);
  }
}));

authRouter.post('/logout', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { refreshToken } = req.body;
      if (refreshToken) {
          await pgPool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
          logger.info(`User logged out, refresh token deleted`);
      } else {
          logger.warn('Logout request missing refresh token');
      }
      res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
      logger.error(`Logout error: ${err}`);
      next(err);
  }
}));

export default authRouter;
