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

const queriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'RESOLVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

// GET /api/admin/queries
router.get('/queries', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, status, priority } = queriesQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where: Prisma.SupportQueryWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { message: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { user: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        { user: { email: { contains: search, mode: Prisma.QueryMode.insensitive } } },
        { user: { phone: { contains: search, mode: Prisma.QueryMode.insensitive } } },
      ];
    }

    const [queries, total] = await Promise.all([
      prisma.supportQuery.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              pan: true,
            },
          },
          replies: {
            include: {
              admin: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.supportQuery.count({ where }),
    ]);

    const formattedQueries = queries.map((q) => ({
      id: q.id,
      clientName: q.user.name,
      clientEmail: q.user.email,
      clientPan: q.user.pan,
      subject: q.subject,
      message: q.message,
      status: q.status === 'PENDING' ? 'open' : 'resolved',
      priority: q.priority.toLowerCase(),
      category: 'General',
      assignedTo: null,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      replies: q.replies.map((r) => ({
        id: r.id,
        adminName: r.admin.name,
        adminEmail: r.admin.email,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
      })),
    }));

    res.json({
      success: true,
      data: {
        items: formattedQueries,
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

// PATCH /api/admin/queries/:id/status
router.patch(
  '/queries/:id/status',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid query ID format') })
        .parse(req.params);
      const bodySchema = z.object({
        status: z.enum(['PENDING', 'RESOLVED']),
      });
      const parsedBody = bodySchema.parse(req.body);

      const query = await prisma.supportQuery.update({
        where: { id },
        data: {
          status: parsedBody.status,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              pan: true,
            },
          },
          replies: {
            include: {
              admin: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      res.json({
        success: true,
        message: `Query status updated to ${parsedBody.status}`,
        data: {
          id: query.id,
          clientName: query.user.name,
          clientEmail: query.user.email,
          clientPan: query.user.pan,
          subject: query.subject,
          message: query.message,
          status: query.status === 'PENDING' ? 'open' : 'resolved',
          priority: query.priority.toLowerCase(),
          category: 'General',
          assignedTo: null,
          createdAt: query.createdAt.toISOString(),
          updatedAt: query.updatedAt.toISOString(),
          replies: query.replies.map((r) => ({
            id: r.id,
            adminName: r.admin.name,
            adminEmail: r.admin.email,
            message: r.message,
            createdAt: r.createdAt.toISOString(),
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/queries/:id/reply
router.post(
  '/queries/:id/reply',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid query ID format') })
        .parse(req.params);
      const bodySchema = z.object({
        message: z.string().min(1, 'Message is required'),
      });
      const parsedBody = bodySchema.parse(req.body);

      if (!req.user) {
        return next(ApiError.unauthorized('Authentication required'));
      }

      const query = await prisma.supportQuery.findUnique({
        where: { id },
      });

      if (!query) {
        return next(ApiError.notFound('Query not found'));
      }

      const reply = await prisma.queryReply.create({
        data: {
          queryId: id,
          adminId: req.user.id,
          message: parsedBody.message,
        },
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      const updatedQuery = await prisma.supportQuery.update({
        where: { id },
        data: {
          status: 'RESOLVED',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              pan: true,
            },
          },
          replies: {
            include: {
              admin: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      res.json({
        success: true,
        message: 'Reply added successfully',
        data: {
          id: updatedQuery.id,
          clientName: updatedQuery.user.name,
          clientEmail: updatedQuery.user.email,
          clientPan: updatedQuery.user.pan,
          subject: updatedQuery.subject,
          message: updatedQuery.message,
          status: updatedQuery.status === 'PENDING' ? 'open' : 'resolved',
          priority: updatedQuery.priority.toLowerCase(),
          category: 'General',
          assignedTo: null,
          createdAt: updatedQuery.createdAt.toISOString(),
          updatedAt: updatedQuery.updatedAt.toISOString(),
          replies: updatedQuery.replies.map((r) => ({
            id: r.id,
            adminName: r.admin.name,
            adminEmail: r.admin.email,
            message: r.message,
            createdAt: r.createdAt.toISOString(),
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/queries/:id
router.delete(
  '/queries/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid query ID format') })
        .parse(req.params);

      const deletedQuery = await prisma.supportQuery.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Successfully deleted query.',
        data: deletedQuery,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;