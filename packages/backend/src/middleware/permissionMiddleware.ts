//packages/backend/src/middleware/permissionMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { getUserPermissions } from '../services/permissionService';
import { AuthRequest } from './auth';
import logger from '../util/logger';

/**
 * Middleware factory to check for a given permission.
 * Example:
 *   app.get('/admin', permit('admin_access'), ...);
 */

export const permit = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      logger.warn('User not authenticated.');
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const permissions = await getUserPermissions(user.uid);
    if (permissions.includes(permission)) {
      logger.info(`Permission "${permission}" granted to user ${user.uid}`);
      return next();
    }
    res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  };
};