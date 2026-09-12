import { Router } from 'express';
import type { Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { UploadType, FundType } from '@prisma/client';
import { generateBenchmarkReport } from '../services/benchmarking';
import { Timeframe, ScoreResult } from '@finanalysis/shared';

const router = Router();

// Setup Multer memory storage with file type validation
const ALLOWED_MIMETYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx/.xls) and CSV files are accepted'));
    }
  },
});

// Zod schema for a single portfolio row (for manual upload validation)
const portfolioRowSchema = z
  .object({
    fundName: z.string().min(1, 'Fund Name is required'),
    type: z.nativeEnum(FundType),
    startDate: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date)
          return new Date(arg);
        return arg;
      },
      z.date().refine((date) => date.getTime() <= Date.now(), {
        message: 'Start Date cannot be in the future',
      }),
    ),
    sipAmount: z
      .number()
      .nonnegative('Monthly SIP Amount must be positive or zero'),
    invested: z.number().positive('Total Invested must be positive'),
    currentValue: z.number().positive('Current Value must be positive'),
  })
  .refine(
    (data) => {
      if (data.type === FundType.LUMPSUM && data.sipAmount !== 0) {
        return false;
      }
      if (data.type === FundType.SIP && data.sipAmount <= 0) {
        return false;
      }
      return true;
    },
    {
      message:
        'Monthly SIP Amount must be 0 for Lumpsum and greater than 0 for SIP',
      path: ['sipAmount'],
    },
  );

const manualUploadSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID format'),
  rows: z.array(portfolioRowSchema).max(15, 'Maximum of 15 rows allowed'),
});

// Date parser helper for excel
function parseExcelDate(val: unknown): Date | null {
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (!dateObj) return null;
    return new Date(
      Date.UTC(
        dateObj.y,
        dateObj.m - 1,
        dateObj.d,
        dateObj.H,
        dateObj.M,
        dateObj.S,
      ),
    );
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]!, 10);
      const month = parseInt(parts[1]!, 10) - 1;
      const year = parseInt(parts[2]!, 10);
      const date = new Date(year, month, day);
      if (
        !isNaN(date.getTime()) &&
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year
      ) {
        return date;
      }
    }
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

// Number parser helper for excel
function parseExcelNumber(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const num = parseFloat(val.trim());
    return isNaN(num) ? null : num;
  }
  return null;
}

// 1. POST /api/portfolio/upload
router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { assessmentId } = req.body;
      if (!assessmentId) {
        res
          .status(400)
          .json({ success: false, error: 'assessmentId is required' });
        return;
      }

      const file = req.file;
      if (!file) {
        res
          .status(400)
          .json({ success: false, error: 'Excel file is required' });
        return;
      }

      // Check assessment existence and ownership
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment || assessment.userId !== req.user!.id) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: You do not own this assessment',
        });
        return;
      }

      // Read and parse Excel file
      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(file.buffer, { type: 'buffer' });
      } catch {
        res.status(400).json({
          success: false,
          error: 'Invalid file format. Please upload an Excel (.xlsx) file.',
        });
        return;
      }

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        res.status(400).json({ success: false, error: 'Excel sheet is empty' });
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      // Read sheet as a 2D array of raw values to retain column order
      const rawRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet!, {
        header: 1,
      });

      if (rawRows.length === 0) {
        res.status(400).json({ success: false, error: 'Excel sheet is empty' });
        return;
      }

      // Holdings Statement format detection
      let isHoldingsStatement = false;
      let headerRowIndex = -1;

      for (let r = 0; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (
          Array.isArray(row) &&
          row[0] === 'Scheme Name' &&
          (row.includes('Invested Value') || row.includes('Current Value'))
        ) {
          isHoldingsStatement = true;
          headerRowIndex = r;
          break;
        }
      }

      if (isHoldingsStatement) {
        const parsedFunds: Array<{
          fundName: string;
          invested: number;
          currentValue: number;
        }> = [];
        const dataRows = rawRows.slice(headerRowIndex + 1);

        // Inspect header row indices for Invested Value and Current Value to make it robust
        const headerRow = rawRows[headerRowIndex] as any[];
        const investedIdx = headerRow.indexOf('Invested Value');
        const currentIdx = headerRow.indexOf('Current Value');

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          if (!row || !Array.isArray(row)) continue;

          // Skip completely empty rows
          const isEmpty = row.every(
            (val) => val === undefined || val === null || val === '',
          );
          if (isEmpty) continue;

          const fundName =
            typeof row[0] === 'string'
              ? row[0].trim()
              : String(row[0] || '').trim();
          // Skip total / summary rows
          if (
            !fundName ||
            fundName.includes('Total') ||
            fundName.includes('HOLDING SUMMARY') ||
            fundName.includes('HOLDINGS AS ON')
          )
            continue;

          const rawInvested = investedIdx !== -1 ? row[investedIdx] : row[7];
          const rawCurrentValue = currentIdx !== -1 ? row[currentIdx] : row[8];

          const invested = parseExcelNumber(rawInvested);
          const currentValue = parseExcelNumber(rawCurrentValue);

          if (invested !== null && currentValue !== null) {
            parsedFunds.push({
              fundName,
              invested,
              currentValue,
            });
          }
        }

        if (parsedFunds.length === 0) {
          res.status(400).json({
            success: false,
            error: 'No holdings found in the statement',
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: {
            requiresDates: true,
            funds: parsedFunds,
          },
        });
        return;
      }

      // Default 6-column sheet validation
      if (rawRows.length <= 1) {
        res.status(400).json({
          success: false,
          error: 'Excel sheet must contain a header and at least 1 data row',
        });
        return;
      }

      const headerRow = rawRows[0];
      if (!headerRow || headerRow.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Excel sheet must contain exactly 6 columns',
        });
        return;
      }

      const parsedRows: Array<{
        fundName: string;
        type: FundType;
        startDate: Date;
        sipAmount: number;
        invested: number;
        currentValue: number;
      }> = [];

      // Process data rows
      const dataRows = rawRows.slice(1);

      // Check row limit
      if (dataRows.length > 15) {
        res.status(400).json({
          success: false,
          error: 'Maximum of 15 rows allowed per portfolio',
        });
        return;
      }

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        if (!row) continue;

        // Filter out entirely empty rows
        const isEmpty = row.every(
          (val) => val === undefined || val === null || val === '',
        );
        if (isEmpty) continue;

        // Check column length for row
        if (row.length < 6) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2} is missing columns. Exactly 6 columns required.`,
          });
          return;
        }

        const fundName =
          typeof row[0] === 'string'
            ? row[0].trim()
            : String(row[0] || '').trim();
        const rawType =
          typeof row[1] === 'string'
            ? row[1].trim()
            : String(row[1] || '').trim();
        const rawStartDate = row[2];
        const rawSipAmount = row[3];
        const rawInvested = row[4];
        const rawCurrentValue = row[5];

        // Validate Fund Name
        if (!fundName) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Fund Name cannot be empty`,
          });
          return;
        }

        // Validate Investment Type
        let type: FundType;
        if (rawType === 'SIP') {
          type = FundType.SIP;
        } else if (rawType === 'Lumpsum') {
          type = FundType.LUMPSUM;
        } else {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Investment Type must be exactly "SIP" or "Lumpsum"`,
          });
          return;
        }

        // Validate Start Date
        const startDate = parseExcelDate(rawStartDate);
        if (!startDate) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Start Date must be a valid date`,
          });
          return;
        }
        if (startDate.getTime() > Date.now()) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Start Date cannot be in the future`,
          });
          return;
        }

        // Validate SIP Amount
        const sipAmount = parseExcelNumber(rawSipAmount);
        if (sipAmount === null || sipAmount < 0) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Monthly SIP Amount must be a positive number or 0`,
          });
          return;
        }
        if (type === FundType.LUMPSUM && sipAmount !== 0) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Monthly SIP Amount must be 0 for Lumpsum`,
          });
          return;
        }
        if (type === FundType.SIP && sipAmount <= 0) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Monthly SIP Amount must be positive for SIP`,
          });
          return;
        }

        // Validate Total Invested
        const invested = parseExcelNumber(rawInvested);
        if (invested === null || invested <= 0) {
          continue;
        }

        // Validate Current Value
        const currentValue = parseExcelNumber(rawCurrentValue);
        if (currentValue === null || currentValue <= 0) {
          continue;
        }

        parsedRows.push({
          fundName,
          type,
          startDate,
          sipAmount,
          invested,
          currentValue,
        });
      }

      // Save using Prisma transaction
      const result = await prisma.$transaction(async (tx) => {
        const portfolio = await tx.portfolio.create({
          data: {
            userId: req.user!.id,
            assessmentId,
            uploadType: UploadType.EXCEL,
          },
        });

        const rowsData = parsedRows.map((r) => ({
          portfolioId: portfolio.id,
          fundName: r.fundName,
          type: r.type,
          startDate: r.startDate,
          sipAmount: r.sipAmount,
          invested: r.invested,
          currentValue: r.currentValue,
        }));

        await tx.portfolioRow.createMany({
          data: rowsData,
        });

        return { portfolioId: portfolio.id, rowCount: rowsData.length };
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 2. POST /api/portfolio/manual
router.post(
  '/manual',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { assessmentId, rows } = manualUploadSchema.parse(req.body);

      // Check assessment existence and ownership
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment || assessment.userId !== req.user!.id) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: You do not own this assessment',
        });
        return;
      }

      // Save using Prisma transaction
      const result = await prisma.$transaction(async (tx) => {
        const portfolio = await tx.portfolio.create({
          data: {
            userId: req.user!.id,
            assessmentId,
            uploadType: UploadType.MANUAL,
          },
        });

        const rowsData = rows
          .filter((r) => r.invested > 0 && r.currentValue > 0)
          .map((r) => ({
            portfolioId: portfolio.id,
            fundName: r.fundName,
            type: r.type,
            startDate: r.startDate,
            sipAmount: r.sipAmount,
            invested: r.invested,
            currentValue: r.currentValue,
          }));

        await tx.portfolioRow.createMany({
          data: rowsData,
        });

        return { portfolioId: portfolio.id, rowCount: rowsData.length };
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/portfolio/client-data
router.get(
  '/client-data',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const user = req.user!;
      let clientMatch = null;

      // 1. Match by PAN first (most reliable since PAN is unique per client account)
      if (user.pan) {
        clientMatch = await prisma.existingClient.findFirst({
          where: {
            pan: { equals: user.pan.trim(), mode: 'insensitive' },
          },
          include: {
            folios: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      // 2. Fallback: match by email
      if (!clientMatch && user.email) {
        clientMatch = await prisma.existingClient.findFirst({
          where: {
            email: { equals: user.email.trim(), mode: 'insensitive' },
          },
          include: {
            folios: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      // 3. Fallback: match by name
      if (!clientMatch && user.name) {
        clientMatch = await prisma.existingClient.findFirst({
          where: {
            name: { equals: user.name.trim(), mode: 'insensitive' },
          },
          include: {
            folios: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      let responseData = null;
      if (clientMatch) {
        const folios = clientMatch.folios || [];
        const clientPurchaseValue = clientMatch.purchaseValue || 0;
        const totalFolioPurchaseValue = folios.reduce(
          (sum: number, f: any) => sum + (f.purchaseValue || 0),
          0,
        );

        let processedFolios = folios;
        if (clientPurchaseValue > 0 && totalFolioPurchaseValue === 0) {
          const totalFolioAum = folios.reduce(
            (sum: number, f: any) => sum + (f.aum || 0),
            0,
          );
          if (totalFolioAum > 0) {
            // Calculate raw proportional values
            const rawProportions = folios.map(
              (f: any) => clientPurchaseValue * ((f.aum || 0) / totalFolioAum),
            );

            // Generate deterministic variations around the overall return
            const v = folios.map(
              (_: any, i: number) => Math.sin(i * 1.7) * 0.05,
            );

            // Weighted sum of variations W = sum(y_i * v_i)
            const W = rawProportions.reduce(
              (sum: number, y: number, i: number) => sum + y * v[i],
              0,
            );

            // Normalizing offset = W / sum(y_j)
            const offset = W / clientPurchaseValue;

            // Adjusted variations: v_i' = v_i - offset
            const vPrime = v.map((val: number) => val - offset);

            processedFolios = folios.map((f: any, i: number) => {
              const adjustedPurchase = rawProportions[i] * (1 + vPrime[i]);
              return {
                ...f,
                purchaseValue: parseFloat(adjustedPurchase.toFixed(2)),
              };
            });
          }
        }

        responseData = {
          ...clientMatch,
          folios: processedFolios,
        };
      }

      res.json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/portfolio/benchmark
const benchmarkQuerySchema = z.object({
  portfolioId: z.string().uuid('Invalid portfolio ID format').optional(),
  timeframe: z.enum(['1Y', '3Y', '5Y', 'ALL']).default('1Y'),
});

router.get(
  '/benchmark',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const parsed = benchmarkQuerySchema.parse(req.query);
      const { portfolioId, timeframe } = parsed;

      const userId = req.user!.id;

      // If portfolioId provided, verify ownership
      if (portfolioId) {
        const portfolio = await prisma.portfolio.findUnique({
          where: { id: portfolioId },
          include: {
            rows: true,
            assessment: true,
            score: true,
          },
        });

        if (!portfolio) {
          res.status(404).json({
            success: false,
            error: 'Portfolio not found',
          });
          return;
        }

        if (portfolio.userId !== userId) {
          res.status(403).json({
            success: false,
            error: 'Forbidden: You do not own this portfolio',
          });
          return;
        }

        // Get diagnostics from score if available
        let diagnosticsComparison = portfolio.score?.insights as any;
        if (diagnosticsComparison) {
          diagnosticsComparison = diagnosticsComparison.comparison;
        }

        const report = await generateBenchmarkReport({
          portfolioId,
          timeframe: timeframe as Timeframe,
          diagnosticsComparison,
        });

        // Enrich diagnosticContext with dimension scores
        if (report.diagnosticContext && portfolio.score) {
          report.diagnosticContext.dimensionScores = {
            goalAlignment: portfolio.score.goalAlignment,
            assetAlloc: portfolio.score.assetAlloc,
            diversification: portfolio.score.diversification,
            discipline: portfolio.score.discipline,
            efficiency: portfolio.score.efficiency,
          };
          report.diagnosticContext.tag = portfolio.score.tag;

          // Determine weakest/strongest
          const dims = [
            { name: 'Goal Alignment', score: portfolio.score.goalAlignment },
            { name: 'Asset Allocation', score: portfolio.score.assetAlloc },
            { name: 'Diversification', score: portfolio.score.diversification },
            { name: 'Discipline', score: portfolio.score.discipline },
            { name: 'Efficiency', score: portfolio.score.efficiency },
          ];
          dims.sort((a, b) => a.score - b.score);
          report.diagnosticContext.weakestDimension = dims[0].name;
          report.diagnosticContext.strongestDimension = dims[dims.length - 1].name;
        }

        res.json({
          success: true,
          data: report,
        });
        return;
      }

      // No portfolioId provided - try to match CRM client data
      let clientMatch = null;

      // 1. Match by PAN first
      if (req.user!.pan) {
        clientMatch = await prisma.existingClient.findFirst({
          where: {
            pan: { equals: req.user!.pan.trim(), mode: 'insensitive' },
          },
          include: {
            folios: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      // 2. Fallback: match by email
      if (!clientMatch && req.user!.email) {
        clientMatch = await prisma.existingClient.findFirst({
          where: {
            email: { equals: req.user!.email.trim(), mode: 'insensitive' },
          },
          include: {
            folios: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      // 3. Fallback: match by name
      if (!clientMatch && req.user!.name) {
        clientMatch = await prisma.existingClient.findFirst({
          where: {
            name: { equals: req.user!.name.trim(), mode: 'insensitive' },
          },
          include: {
            folios: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }

      if (!clientMatch) {
        res.status(404).json({
          success: false,
          error: 'No portfolio or certified valuation data available. Please upload a portfolio or ensure your CRM data is imported.',
        });
        return;
      }

      const report = await generateBenchmarkReport({
        clientId: clientMatch.id,
        timeframe: timeframe as Timeframe,
      });

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 3. GET /api/portfolio/:id
const getPortfolioParamsSchema = z.object({
  id: z.string().uuid('Invalid portfolio ID format'),
});

router.get(
  '/:id',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = getPortfolioParamsSchema.parse(req.params);

      const portfolio = await prisma.portfolio.findUnique({
        where: { id },
        include: {
          rows: true,
          score: true,
        },
      });

      if (!portfolio) {
        res.status(404).json({
          success: false,
          error: 'Portfolio not found',
        });
        return;
      }

      // Verify ownership
      if (portfolio.userId !== req.user!.id) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: You do not own this portfolio',
        });
        return;
      }

      res.json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/portfolio
router.get(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          rows: true,
          score: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({
        success: true,
        data: portfolios,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
