// src/routes/authRouter.ts
import express, { Request, Response } from 'express';
import { pi } from '../services/piService'; // Pi Network SDK integration
import { signToken } from '../util/jwt';
import { asyncHandler } from '../middleware/asyncHandler';
import { upsertUser } from '../services/userService';
import logger from '../util/logger';

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

export default authRouter;
