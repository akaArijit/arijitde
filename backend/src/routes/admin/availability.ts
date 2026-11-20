import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ApiError } from '../../lib/api-error';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/availability
router.get('/availability', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const availability = await prisma.availabilitySlot.findMany({
      orderBy: { slot: 'asc' },
    });

    res.json({
      success: true,
      data: availability.map((a) => a.slot),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/availability
router.post(
  '/availability',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { slots } = z
        .object({ slots: z.array(z.string().datetime()) })
        .parse(req.body);

      await prisma.availabilitySlot.deleteMany({});

      if (slots.length > 0) {
        await prisma.availabilitySlot.createMany({
          data: slots.map((slot) => ({ slot: new Date(slot) })),
        });
      }

      res.json({
        success: true,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;