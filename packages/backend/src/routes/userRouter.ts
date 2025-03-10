import { Router, Request, Response, NextFunction } from 'express';
import { getUserById, updateUserBalance, upsertUser } from '../services/userService';
import { asyncHandler } from '../middleware/asyncHandler';
import logger from '../util/logger';

const router = Router();

// Get user by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  logger.info(`Request to get user with ID: ${id}`);
  const user = await getUserById(id);
  if (!user) {
    logger.warn(`User not found: ${id}`);
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json(user);
}));

// Update user balance
router.post('/:id/balance', asyncHandler(async (req: Request, res: Response) => {
  const { balance } = req.body;
  logger.info(`Request to update balance for user ${req.params.id} to ${balance}`);

  await updateUserBalance(req.params.id, balance);
  res.status(200).json({ message: 'User balance updated successfully' });
}));

// Upsert user
router.post('/upsert', asyncHandler(async (req: Request, res: Response) => {
  logger.info(`Request to upsert user with ID: ${req.body.uid}`);
  await upsertUser(req.body);
  res.status(200).json({ message: 'User upserted successfully' });
}))

export default router;
