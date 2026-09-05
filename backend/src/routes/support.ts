import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';

const router = Router(); // support query router

const querySchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(150),
  message: z.string().min(1, 'Message is required').max(2000),
});

// 1. POST /api/support/query
router.post(
  '/query',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const body = querySchema.parse(req.body);

      const supportQuery = await prisma.supportQuery.create({
        data: {
          userId,
          subject: body.subject,
          message: body.message,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Support query submitted successfully',
        data: supportQuery,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 2. GET /api/support/my-queries
router.get(
  '/my-queries',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const queries = await prisma.supportQuery.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: queries,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
