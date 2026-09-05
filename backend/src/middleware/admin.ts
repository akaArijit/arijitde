import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth';
import { Role } from '@prisma/client';

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: User authentication required',
    });
    return;
  }

  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Admin access required',
    });
    return;
  }

  next();
}
