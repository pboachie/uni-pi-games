// src/routes/authRouter.ts
import express, { Request, Response, NextFunction } from 'express';
import { pi } from '../services/piService'; // Pi Network SDK integration
import { signToken } from '../util/jwt';
import { asyncHandler } from '../middleware/asyncHandler';

const authRouter = express.Router();

authRouter.post('/signin', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { piUserId, accessToken } = req.body;
    // Verify user with Pi Network SDK
    const user = await (pi as any).verifyUser(piUserId, accessToken);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ uid: user.uid, role: 'user' });
    return res.status(200).json({ token });
  } catch (error) {
    console.error('Sign-in error:', error);
    return res.status(500).json({ error: 'Sign-in failed' });
  }
}));

export default authRouter;
