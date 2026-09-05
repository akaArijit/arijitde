import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    name: string | null;
    role: Role;
    phone: string | null;
    pan: string | null;
    dob: Date | null;
    anniversary: Date | null;
    createdAt: Date;
    referralCode: string | null;
    referrerId: string | null;
    client?: {
      activePlan: string | null;
      advisorNotes: string | null;
      activatedAt: Date;
    } | null;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Access token is missing or invalid',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Access token is empty',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    
    // Fetch the user from the database to check if they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        pan: true,
        dob: true,
        anniversary: true,
        createdAt: true,
        referralCode: true,
        referrerId: true,
        client: {
          select: {
            activePlan: true,
            advisorNotes: true,
            activatedAt: true,
          }
        }
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User does not exist',
      });
      return;
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Token has expired or is invalid',
    });
  }
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        pan: true,
        dob: true,
        anniversary: true,
        createdAt: true,
        referralCode: true,
        referrerId: true,
        client: {
          select: {
            activePlan: true,
            advisorNotes: true,
            activatedAt: true,
          }
        }
      },
    });

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Ignore invalid/expired token for optional auth, allowing public visitor to proceed
  }

  next();
}
