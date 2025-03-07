//packages/backend/src/middleware/auth.ts
import { cfg } from '../util/env';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: { uid: string };
}

import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret') as { uid: string };
      req.user = { uid: decoded.uid };
      next(); // Pass control to the next handler
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
  };

