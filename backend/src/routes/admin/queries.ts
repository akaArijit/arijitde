import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ApiError } from '../../lib/api-error';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/queries
router.get('/queries', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const queries = await prisma.supportQuery.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: queries,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/queries/:id
router.patch(
  '/queries/:id',
  async (req: AuthenticatedRequest, res: Response, next) => {
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
      });

      res.json({
        success: true,
        message: `Query status updated to ${parsedBody.status}`,
        data: query,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/queries/:id
router.delete(
  '/queries/:id',
  async (req: AuthenticatedRequest, res: Response, next) => {
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