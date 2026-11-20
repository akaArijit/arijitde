import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { Role } from '@prisma/client';
import { ApiError } from '../../lib/api-error';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/users
router.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          pan: true,
          role: true,
          dob: true,
          anniversary: true,
          createdAt: true,
          referralCode: true,
          _count: {
            select: {
              assessments: true,
              portfolios: true,
              leads: true,
            },
          },
          client: {
            select: {
              activePlan: true,
              advisorNotes: true,
              activatedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/:id/role
const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

router.post(
  '/:id/role',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid user ID format') })
        .parse(req.params);
      const { role } = updateRoleSchema.parse(req.body);

      if (id === req.user!.id) {
        return next(ApiError.badRequest('You cannot modify your own role.'));
      }

      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        return next(ApiError.notFound('User not found'));
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: { role },
        });

        if (role === 'CLIENT') {
          await tx.client.upsert({
            where: { userId: id },
            update: {},
            create: {
              userId: id,
              activePlan: 'PREMIUM',
              advisorNotes: 'Promoted to client',
              activatedAt: new Date(),
            },
          });
        } else {
          await tx.client.deleteMany({ where: { userId: id } });
        }

        return user;
      });

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/users/:id/client-profile
const updateClientProfileSchema = z.object({
  advisorNotes: z.string().optional(),
  activePlan: z.string().optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Invalid PAN format').optional().nullable(),
});

router.post(
  '/:id/client-profile',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid user ID format') })
        .parse(req.params);
      const { advisorNotes, activePlan, pan } = updateClientProfileSchema.parse(req.body);

      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        return next(ApiError.notFound('User not found'));
      }

      const clientProfile = await prisma.$transaction(async (tx) => {
        if (pan !== undefined) {
          await tx.user.update({
            where: { id },
            data: { pan: pan === '' ? null : pan },
          });
        }

        return tx.client.upsert({
          where: { userId: id },
          update: {
            advisorNotes,
            activePlan,
          },
          create: {
            userId: id,
            advisorNotes: advisorNotes || '',
            activePlan: activePlan || 'PREMIUM',
            activatedAt: new Date(),
          },
        });
      });

      res.json({
        success: true,
        data: clientProfile,
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return next(ApiError.conflict('This PAN number is already assigned to another user account.'));
        }
      }
      next(error);
    }
  }
);

export default router;