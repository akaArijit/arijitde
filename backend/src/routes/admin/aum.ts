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

const aumQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  sortBy: z.enum(['totalAUM', 'absoluteReturn', 'cagr', 'xirr', 'folioCount']).default('totalAUM'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

function computeAUM(client: any): {
  totalAUM: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalGain: number;
  absoluteReturn: number;
  cagr: number;
  xirr: number;
  folioCount: number;
} {
  const folios = client.folios || [];
  const folioCount = folios.length;
  
  const totalAUM = folios.reduce((sum: number, f: any) => sum + (f.aum || 0), 0);
  const totalInvested = folios.reduce((sum: number, f: any) => sum + (f.purchaseValue || 0), 0);
  const totalCurrentValue = folios.reduce((sum: number, f: any) => sum + (f.aum || 0), 0);
  const totalGain = totalCurrentValue - totalInvested;
  const absoluteReturn = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  
  const avgCagr = folioCount > 0 
    ? folios.reduce((sum: number, f: any) => sum + (f.cagr || 0), 0) / folioCount 
    : 0;
  const avgXirr = folioCount > 0 
    ? folios.reduce((sum: number, f: any) => sum + (f.xirr || 0), 0) / folioCount 
    : 0;

  return {
    totalAUM,
    totalInvested,
    totalCurrentValue,
    totalGain,
    absoluteReturn,
    cagr: avgCagr,
    xirr: avgXirr,
    folioCount,
  };
}

async function recalculateClientAUM(clientId: string) {
  const client = await prisma.existingClient.findUnique({
    where: { id: clientId },
    include: { folios: true },
  });

  if (!client) {
    throw ApiError.notFound('Client not found');
  }

  const aumData = computeAUM(client);

  return prisma.existingClient.update({
    where: { id: clientId },
    data: {
      totalAUM: aumData.totalAUM,
      totalInvested: aumData.totalInvested,
      totalCurrentValue: aumData.totalCurrentValue,
      totalGain: aumData.totalGain,
      absoluteReturn: aumData.absoluteReturn,
      cagr: aumData.cagr,
      xirr: aumData.xirr,
      folioCount: aumData.folioCount,
      lastCalculatedAt: new Date(),
    },
  });
}

// GET /api/admin/aum
router.get('/aum', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, sortBy, sortOrder } = aumQuerySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { pan: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.existingClient.findMany({
        where,
        include: { folios: true },
        skip,
        take: limit,
      }),
      prisma.existingClient.count({ where }),
    ]);

    const aumRecords = clients.map((client) => {
      const aum = computeAUM(client);
      return {
        id: client.id,
        clientName: client.name,
        clientEmail: client.email,
        clientPan: client.pan,
        ...aum,
        lastCalculated: client.lastCalculatedAt?.toISOString() || client.updatedAt.toISOString(),
      };
    });

    aumRecords.sort((a, b) => {
      const aVal = a[sortBy] ?? 0;
      const bVal = b[sortBy] ?? 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    res.json({
      success: true,
      data: {
        items: aumRecords,
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

// POST /api/admin/aum/recalculate/:clientId
router.post(
  '/aum/recalculate/:clientId',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { clientId } = z
        .object({ clientId: z.string().uuid('Invalid client ID format') })
        .parse(req.params);

      const updatedClient = await recalculateClientAUM(clientId);

      res.json({
        success: true,
        data: updatedClient,
        message: 'AUM recalculated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/aum/recalculate (bulk)
router.post(
  '/aum/recalculate',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const clients = await prisma.existingClient.findMany({
        include: { folios: true },
      });

      let updatedCount = 0;
      const chunkSize = 100;

      for (let i = 0; i < clients.length; i += chunkSize) {
        const chunk = clients.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map((client) =>
            recalculateClientAUM(client.id).catch(() => null)
          )
        );
        updatedCount += chunk.length;
      }

      res.json({
        success: true,
        message: `AUM recalculated for ${updatedCount} clients`,
        data: { count: updatedCount },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;