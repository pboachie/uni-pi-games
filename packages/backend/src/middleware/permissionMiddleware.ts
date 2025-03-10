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
export const permit = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      logger.warn('User not authenticated.');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const permissions = await getUserPermissions(user.uid);
    if (permissions.includes(requiredPermission)) {
      logger.info(`Permission "${requiredPermission}" granted to user ${user.uid}`);
      return next();
    } else {
      logger.error(`Permission "${requiredPermission}" denied for user ${user.uid}`);
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
  };
};
