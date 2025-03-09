//packages/backend/src/middleware/permissionMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { getUserPermissions } from '../services/permissionService';
import { AuthRequest } from './auth';

/**
 * Middleware factory to check for a given permission.
 * Example:
 *   app.get('/admin', permit('admin_access'), ...);
 */
export const permit = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const permissions = await getUserPermissions(user.uid);
    if (permissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
  };
};
