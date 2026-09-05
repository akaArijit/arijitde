import { Router } from 'express';
import type { Response } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { UploadType, FundType } from '@prisma/client';

const router = Router();

// Setup Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
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
  rows: z
    .array(portfolioRowSchema)
    .min(1, 'At least 1 row required')
    .max(15, 'Maximum of 15 rows allowed'),
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

// Percentage / decimal parser for XIRR
function parseXirr(val: unknown): number {
  if (val === undefined || val === null) return 8; // default to 8% if missing
  if (typeof val === 'number') {
    // Excel stores e.g. 8.93% as 0.0893
    if (val > -1 && val < 1 && val !== 0) {
      return val * 100;
    }
    return val;
  }
  const str = String(val).trim();
  const num = parseFloat(str.replace(/%/g, ''));
  if (isNaN(num)) return 8;
  return num;
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

      if (rawRows.length <= 1) {
        res.status(400).json({
          success: false,
          error: 'Excel sheet must contain a header and at least 1 data row',
        });
        return;
      }

      // Validate headers size (at least 8 columns required for matching format)
      const headerRow = rawRows[0];
      if (!headerRow || headerRow.length < 8) {
        res.status(400).json({
          success: false,
          error:
            'Excel sheet must contain at least 8 matching columns (AMC, Category, Sub-category, Folio No., Source, Units, Invested Value, Current Value)',
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
        if (row.length < 8) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2} is missing columns. At least 8 columns required.`,
          });
          return;
        }

        const rawAmc =
          typeof row[0] === 'string'
            ? row[0].trim()
            : String(row[0] || '').trim();
        const rawCategory =
          typeof row[1] === 'string'
            ? row[1].trim()
            : String(row[1] || '').trim();
        const rawSubCategory =
          typeof row[2] === 'string'
            ? row[2].trim()
            : String(row[2] || '').trim();

        // Combine AMC and Sub-category to form the fundName
        const fundName = `${rawAmc} ${rawSubCategory}`.trim();

        const rawInvested = row[6];
        const rawCurrentValue = row[7];
        const rawXirr = row[9]; // index 9 (XIRR column)

        // Validate Fund Name
        if (
          !fundName ||
          fundName === 'undefined undefined' ||
          fundName === 'null null'
        ) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: AMC and Sub-category cannot be empty`,
          });
          return;
        }

        // Validate Total Invested
        const invested = parseExcelNumber(rawInvested);
        if (invested === null || invested <= 0) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Invested Value must be a positive number`,
          });
          return;
        }

        // Validate Current Value
        const currentValue = parseExcelNumber(rawCurrentValue);
        if (currentValue === null || currentValue <= 0) {
          res.status(400).json({
            success: false,
            error: `Row ${i + 2}: Current Value must be a positive number`,
          });
          return;
        }

        // Parse XIRR (or default if missing)
        const xirrPct = parseXirr(rawXirr);

        // Estimate investment duration in years based on XIRR and Returns
        // Formula: years = Returns / (Invested * XIRR_Decimal)
        const returns = currentValue - invested;
        const xirrDecimal = xirrPct / 100;

        let years = 2.0; // default 2 years fallback
        if (invested > 0 && xirrDecimal !== 0) {
          const calculatedYears = returns / (invested * xirrDecimal);
          if (
            !isNaN(calculatedYears) &&
            calculatedYears > 0.1 &&
            calculatedYears < 20
          ) {
            years = calculatedYears;
          }
        }

        // Compute startDate
        const startDate = new Date(
          Date.now() - years * 365.25 * 24 * 60 * 60 * 1000,
        );

        // Estimate monthly SIP amount
        // Standard heuristic: total invested / duration in months
        const sipAmount = Math.max(500, Math.round(invested / (years * 12)));

        // Default type to SIP
        const type = FundType.SIP;

        parsedRows.push({
          fundName,
          type,
          startDate,
          sipAmount,
          invested,
          currentValue,
        });
      }

      if (parsedRows.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Excel sheet must contain at least 1 valid data row',
        });
        return;
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

        const rowsData = rows.map((r) => ({
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

      res.json({
        success: true,
        data: clientMatch,
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

// POST /api/portfolio/from-folios
// Auto-create a portfolio from existing client's Folio records
const fromFoliosSchema = z.object({
  assessmentId: z.string().uuid('Invalid assessment ID format'),
});

router.post(
  '/from-folios',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { assessmentId } = fromFoliosSchema.parse(req.body);
      const user = req.user!;

      // Find matching ExistingClient
      let clientMatch = null;

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

      if (!clientMatch || clientMatch.folios.length === 0) {
        res.status(404).json({
          success: false,
          error:
            'No existing client records found. Please upload your portfolio CSV instead.',
        });
        return;
      }

      // Convert Folios to PortfolioRows
      // Group by schemeName to consolidate multiple folios for the same scheme
      const schemeMap = new Map<
        string,
        { invested: number; currentValue: number; units: number }
      >();
      for (const folio of clientMatch.folios) {
        const schemeName = folio.schemeName || 'Unknown Fund';
        const existing = schemeMap.get(schemeName) || {
          invested: 0,
          currentValue: 0,
          units: 0,
        };
        existing.invested += folio.purchaseValue || 0;
        existing.currentValue += folio.aum || 0;
        existing.units += folio.units || 0;
        schemeMap.set(schemeName, existing);
      }

      // Create portfolio rows from consolidated scheme data
      const portfolioRowsData = Array.from(schemeMap.entries())
        .filter(([, data]) => data.currentValue > 0 || data.invested > 0)
        .map(([schemeName, data]) => ({
          fundName: schemeName,
          // Determine type: if invested is split over time (indicative of SIP) vs lump sum
          // Heuristic: if there are multiple folios for this scheme, likely SIP
          type: FundType.SIP as FundType, // Default to SIP for existing clients
          startDate: clientMatch!.firstInvestmentDate
            ? new Date(clientMatch!.firstInvestmentDate)
            : new Date(Date.now() - 2 * 365.25 * 24 * 60 * 60 * 1000), // Default 2 years ago
          sipAmount: Math.round(data.invested / 24), // Estimate monthly SIP from total invested / 24 months
          invested: data.invested,
          currentValue: data.currentValue,
        }));

      if (portfolioRowsData.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid fund data found in your existing records.',
        });
        return;
      }

      // Create portfolio with rows in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const portfolio = await tx.portfolio.create({
          data: {
            userId: user.id,
            assessmentId,
            uploadType: UploadType.FOLIO_IMPORT,
            rows: {
              create: portfolioRowsData,
            },
          },
          include: {
            rows: true,
          },
        });
        return portfolio;
      });

      res.status(201).json({
        success: true,
        data: {
          portfolioId: result.id,
          rowCount: result.rows.length,
          totalInvested: portfolioRowsData.reduce(
            (sum, r) => sum + r.invested,
            0,
          ),
          totalCurrentValue: portfolioRowsData.reduce(
            (sum, r) => sum + r.currentValue,
            0,
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
