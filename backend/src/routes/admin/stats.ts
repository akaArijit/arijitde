import { Router } from 'express';
import type { Response, Request } from 'express';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { Role, LeadStatus } from '@prisma/client';
import { ApiError } from '../../lib/api-error';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalLeads,
      attendedLeads,
      totalFolios,
      totalExistingClients,
      totalPortfolioValuations,
      existingClients,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.lead.count(),
      prisma.lead.count({
        where: { status: { in: [LeadStatus.CONTACTED, LeadStatus.CONVERTED] } },
      }),
      prisma.folio.count(),
      prisma.existingClient.count(),
      prisma.existingClient.count({
        where: {
          OR: [
            { balanceUnits: { not: null } },
            { purchaseValue: { not: null } },
            { currentValue: { not: null } },
          ],
        },
      }),
      prisma.existingClient.findMany({
        select: {
          aum: true,
          currentValue: true,
        },
      }),
    ]);

    const totalAUM = existingClients.reduce((sum: number, client: any) => {
      const val =
        client.currentValue !== null && client.currentValue !== undefined
          ? client.currentValue
          : client.aum !== null && client.aum !== undefined
            ? client.aum
            : 0;
      return sum + val;
    }, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalClients,
        totalLeads,
        attendedLeads,
        totalFolios,
        totalExistingClients,
        totalPortfolioValuations,
        totalAUM,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;