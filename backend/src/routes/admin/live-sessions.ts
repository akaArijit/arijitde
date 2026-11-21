import { Router, Response, Request, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ApiError } from '../../lib/api-error';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

const liveSessionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'WAITING', 'ENDED']).optional(),
});

// GET /api/admin/live-sessions
router.get('/live-sessions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status } = liveSessionsQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: Prisma.LiveSessionWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { client: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        { client: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        { client: { pan: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        { consultant: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        { consultant: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
      ];
    }

    const [sessions, total] = await Promise.all([
      prisma.liveSession.findMany({
        where,
        include: {
          client: {
            select: {
              name: true,
              email: true,
              pan: true,
            },
          },
          consultant: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.liveSession.count({ where }),
    ]);

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      clientName: s.client.name,
      clientEmail: s.client.email,
      clientPan: s.client.pan,
      status: s.status.toLowerCase(),
      startTime: s.startTime.toISOString(),
      endTime: s.endTime?.toISOString() || null,
      duration: s.duration,
      consultantName: s.consultant.name,
      consultantEmail: s.consultant.email,
      googleMeetLink: s.googleMeetLink,
    }));

    res.json({
      success: true,
      data: {
        items: formattedSessions,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/live-sessions/:id/end
router.post(
  '/live-sessions/:id/end',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid session ID format') })
        .parse(req.params);

      const session = await prisma.liveSession.findUnique({
        where: { id },
      });

      if (!session) {
        return next(ApiError.notFound('Live session not found'));
      }

      if (session.status === 'ENDED') {
        return next(ApiError.badRequest('Session is already ended'));
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

      const updatedSession = await prisma.liveSession.update({
        where: { id },
        data: {
          status: 'ENDED',
          endTime,
          duration,
        },
        include: {
          client: {
            select: {
              name: true,
              email: true,
              pan: true,
            },
          },
          consultant: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: {
          id: updatedSession.id,
          clientName: updatedSession.client.name,
          clientEmail: updatedSession.client.email,
          clientPan: updatedSession.client.pan,
          status: updatedSession.status.toLowerCase(),
          startTime: updatedSession.startTime.toISOString(),
          endTime: updatedSession.endTime?.toISOString() || null,
          duration: updatedSession.duration,
          consultantName: updatedSession.consultant.name,
          consultantEmail: updatedSession.consultant.email,
          googleMeetLink: updatedSession.googleMeetLink,
        },
        message: 'Session ended successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;