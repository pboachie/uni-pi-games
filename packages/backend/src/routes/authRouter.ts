// src/routes/authRouter.ts
import express, { Request, Response, NextFunction } from 'express';
import { pi } from '../services/piService'; // Pi Network SDK integration
import { signToken } from '../util/jwt';
import { asyncHandler } from '../middleware/asyncHandler';
import { upsertUser } from '../services/userService';

const authRouter = express.Router();

authRouter.post('/signin', asyncHandler(async (req: Request, res: Response) => {
  const { piUserId, accessToken } = req.body;
  // Verify user with Pi Network SDK
  const user = await (pi as any).verifyUser(piUserId, accessToken);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Upsert user into DB to track created and last login times
  await upsertUser(user);

  // Include scopes from the user object in the token payload
  const token = signToken({ uid: user.uid, role: 'user', scopes: user.scopes || [] });
  return res.status(200).json({ token });
}));

export default authRouter;
