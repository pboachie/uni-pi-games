import { Router, Request, Response, NextFunction } from 'express';
import { getUserById, updateUserBalance, upsertUser } from '../services/userService';
import { asyncHandler } from '../middleware/asyncHandler';
import { getUserPermissions } from '../services/permissionService';
import { permit } from '../middleware/permissionMiddleware';
import logger from '../util/logger';

const router = Router();

// Custom middleware for self or admin access
const canAccessUserData = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }
  const targetId = req.params.id;
  if (user.uid === targetId) {
    return next();
  }
  const permissions = await getUserPermissions(user.uid);
  if (permissions.includes('admin_access')) {
    return next();
  }
  res.status(403).json({ error: 'Forbidden: insufficient permissions' });
};

// Get user by ID
router.get('/:id', canAccessUserData, asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  logger.info(`Request to get user with ID: ${id}`);
  const user = await getUserById(id);
  if (!user) {
    logger.warn(`User not found: ${id}`);
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.status(200).json(user);
}));

// Update user balance
router.post('/:id/balance', permit('admin_access'), asyncHandler(async (req: Request, res: Response) => {
  const { balance } = req.body;
  logger.info(`Request to update balance for user ${req.params.id} to ${balance}`);
  await updateUserBalance(req.params.id, balance);
  res.status(200).json({ message: 'User balance updated successfully' });
}));

// Upsert user
router.post('/upsert', permit('admin_access'), asyncHandler(async (req: Request, res: Response) => {
  logger.info(`Request to upsert user with ID: ${req.body.uid}`);
  await upsertUser(req.body);
  res.status(200).json({ message: 'User upserted successfully' });
}));

export default router;