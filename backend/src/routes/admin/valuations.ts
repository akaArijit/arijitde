import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import ExcelJS from 'exceljs';
import path from 'path';
import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { authMiddleware } from '../../middleware/auth';
import { adminMiddleware } from '../../middleware/admin';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ApiError } from '../../lib/api-error';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

const ALLOWED_MIMETYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ALLOWED_MIMETYPES.includes(file.mimetype) ||
      ext === '.csv' ||
      ext === '.xlsx' ||
      ext === '.xls'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx/.xls) and CSV files are accepted'));
    }
  },
});

function parseExcelNumber(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const clean = val.replace(/,/g, '').replace(/[₹$%]/g, '').trim();
    if (clean === '') return null;
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }
  return null;
}

function getRowValue(row: Record<string, any>, aliases: string[]): any {
  for (const alias of aliases) {
    if (row[alias] !== undefined) return row[alias];
    const cleanAlias = alias.trim().toLowerCase().replace(/\s+/g, '');
    for (const key of Object.keys(row)) {
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '');
      if (cleanKey === cleanAlias) {
        return row[key];
      }
    }
  }
  return undefined;
}

function findHeaderRowIndex(
  worksheet: ExcelJS.Worksheet,
  headerIndicators: string[],
): number {
  const headerIndicatorsClean = headerIndicators.map((indicator) =>
    indicator.trim().toLowerCase().replace(/\s+/g, ''),
  );

  let headerRowIndex = 0;
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (headerRowIndex !== 0) return;
    const rowStrings: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      rowStrings.push(String(cell.value || '').trim().toLowerCase().replace(/\s+/g, ''));
    });
    const found = headerIndicatorsClean.some((indicator) => rowStrings.includes(indicator));
    if (found) {
      headerRowIndex = rowNumber - 1;
    }
  });
  return headerRowIndex;
}

function parseAvgHoldingDays(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).toLowerCase().trim();
  if (str === '') return null;

  const yrMoRegex =
    /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)s?,?\s*(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)s?/;
  const yrMoMatch = str.match(yrMoRegex);
  if (yrMoMatch) {
    const yrs = parseFloat(yrMoMatch[1]);
    const mos = parseFloat(yrMoMatch[2]);
    return Math.round(yrs * 365 + mos * 30.417);
  }

  const moRegex = /(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)s?/;
  if (str.includes('month') || str.includes('mo')) {
    const moMatch = str.match(moRegex);
    if (moMatch) {
      const mos = parseFloat(moMatch[1]);
      return Math.round(mos * 30.417);
    }
  }

  const yrRegex = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)s?/;
  if (str.includes('year') || str.includes('yr')) {
    const yrMatch = str.match(yrRegex);
    if (yrMatch) {
      const yrs = parseFloat(yrMatch[1]);
      return Math.round(yrs * 365);
    }
  }

  const clean = str.replace(/days?/g, '').replace(/,/g, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return null;

  if (num <= 15) {
    return Math.round(num * 365);
  }
  return num;
}

// GET /api/admin/portfolio-valuations
router.get('/portfolio-valuations', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const search = ((req.query.search as string) || '').trim();

    const skip = (page - 1) * limit;

    const baseWhere: Prisma.ExistingClientWhereInput = {
      OR: [
        { balanceUnits: { not: null } },
        { purchaseValue: { not: null } },
        { currentValue: { not: null } },
      ],
    };

    if (search) {
      (baseWhere as any).AND = [
        {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { pan: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { iwellCode: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { iwellCode2: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.existingClient.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.existingClient.count({ where: baseWhere }),
    ]);

    const valuations = clients.map((c) => ({
      id: c.id,
      clientName: c.name,
      iwellCode: c.iwellCode,
      iwellCode2: c.iwellCode2,
      pan: c.pan,
      balanceUnits: c.balanceUnits,
      purchaseValue: c.purchaseValue,
      currentValue: c.currentValue,
      oneDayChange: c.oneDayChange,
      dividend: c.dividend,
      averageHoldingDays: c.averageHoldingDays,
      gain: c.gain,
      absoluteReturn: c.absoluteReturn,
      cagr: c.cagr,
      xirr: c.xirr,
      createdAt: c.createdAt,
    }));

    res.json({
      success: true,
      data: {
        valuations,
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

// POST /api/admin/portfolio-valuations/upload
router.post(
  '/portfolio-valuations/upload',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const file = req.file;
      if (!file) {
        return next(ApiError.badRequest('CSV/Excel file is required'));
      }

      let workbook: ExcelJS.Workbook;
      try {
        workbook = new ExcelJS.Workbook();
        // file.buffer is already a Buffer (Uint8Array) in Node.js
        await workbook.xlsx.load(file.buffer as any);
      } catch {
        return next(ApiError.badRequest('Invalid file format. Please upload a valid CSV or Excel file.'));
      }

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        return next(ApiError.badRequest('File sheet is empty'));
      }

      const headerRowIndex = findHeaderRowIndex(worksheet, ['Client Name', 'Name']);
      if (headerRowIndex === -1) {
        return next(ApiError.badRequest('Could not find header row with "Client Name" or "Name"'));
      }

      const headerRow = worksheet.getRow(headerRowIndex + 1);
      const headers: string[] = [];
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        headers[colNumber - 1] = String(cell.value || `col_${colNumber}`);
      });

      const rawRows: Record<string, any>[] = [];
      for (let rowNum = headerRowIndex + 2; rowNum <= worksheet.rowCount; rowNum++) {
        const row = worksheet.getRow(rowNum);
        const rowData: Record<string, any> = {};
        let hasData = false;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (headers[colNumber - 1]) {
            rowData[headers[colNumber - 1]] = cell.value;
            if (cell.value !== null && cell.value !== undefined && String(cell.value).trim() !== '') {
              hasData = true;
            }
          }
        });
        if (hasData) {
          rawRows.push(rowData);
        }
      }

      if (rawRows.length === 0) {
        return next(ApiError.badRequest('File contains no data rows'));
      }

      const requiredFields = [
        { name: 'Client Name', aliases: ['Client Name', 'CLIENT NAME'] },
        { name: 'PAN Number', aliases: ['PAN Number', 'PAN', 'PAN NUMBER'] },
      ];

      const firstRow = rawRows[0] || {};
      const missingKeys = [];
      for (const f of requiredFields) {
        const val = getRowValue(firstRow, f.aliases);
        if (val === undefined || String(val).trim() === '') {
          missingKeys.push(f.name);
        }
      }

      if (missingKeys.length > 0) {
        return next(ApiError.badRequest(`Missing required CSV headers: ${missingKeys.join(', ')}`));
      }

      const parsedValuations = rawRows.map((row) => ({
        clientName: String(getRowValue(row, ['Client Name', 'CLIENT NAME']) || '').trim() || null,
        iwellCode: String(getRowValue(row, ['IWELL Code', 'IWELL CODE']) || '').trim() || null,
        iwellCode2: String(getRowValue(row, ['IWELL Code 2', 'IWELLCODE2']) || '').trim() || null,
        pan: String(getRowValue(row, ['PAN Number', 'PAN', 'PAN NUMBER']) || '').trim().toUpperCase() || null,
        balanceUnits: parseExcelNumber(getRowValue(row, ['Balance Units', 'BALANCE UNITS'])),
        purchaseValue: parseExcelNumber(getRowValue(row, ['Purchase Value', 'PURCHASE VALUE'])),
        currentValue: parseExcelNumber(getRowValue(row, ['Current Value', 'CURRENT VALUE'])),
        oneDayChange: parseExcelNumber(getRowValue(row, ['One-Day Change', 'ONE DAY CHANGE'])),
        dividend: parseExcelNumber(getRowValue(row, ['Dividend', 'DIVIDEND'])),
        averageHoldingDays: parseAvgHoldingDays(getRowValue(row, ['Average Holding Days', 'AVG HOLDING DAYS'])),
        gain: parseExcelNumber(getRowValue(row, ['Gain', 'GAIN'])),
        absoluteReturn: parseExcelNumber(getRowValue(row, ['Absolute Return (%)', 'ABSOLUTE RETURN'])),
        cagr: parseExcelNumber(getRowValue(row, ['CAGR (%)', 'CAGR'])),
        xirr: parseExcelNumber(getRowValue(row, ['XIRR (%)', 'XIRR', 'xirr'])),
      }));

      const count = await prisma.$transaction(
        async (tx) => {
          await tx.existingClient.updateMany({
            data: {
              balanceUnits: null,
              purchaseValue: null,
              currentValue: null,
              oneDayChange: null,
              dividend: null,
              averageHoldingDays: null,
              gain: null,
              absoluteReturn: null,
              cagr: null,
              xirr: null,
            },
          });

          const clients = await tx.existingClient.findMany({});
          const clientByPan = new Map<string, any>();
          const clientByName = new Map<string, any>();
          for (const c of clients) {
            if (c.pan) {
              clientByPan.set(c.pan.trim().toUpperCase(), c);
            }
            if (c.name) {
              clientByName.set(c.name.trim().toLowerCase(), c);
            }
          }

          const clientsToUpdate: Array<{ id: string; data: any }> = [];
          const clientsToCreateMap = new Map<string, any>();

          for (const row of parsedValuations) {
            let match = null;
            if (row.pan) {
              match = clientByPan.get(row.pan.trim().toUpperCase());
            }
            if (!match && row.clientName) {
              match = clientByName.get(row.clientName.trim().toLowerCase());
            }

            if (match) {
              clientsToUpdate.push({
                id: match.id,
                data: {
                  balanceUnits: row.balanceUnits,
                  purchaseValue: row.purchaseValue,
                  currentValue: row.currentValue,
                  oneDayChange: row.oneDayChange,
                  dividend: row.dividend,
                  averageHoldingDays: row.averageHoldingDays,
                  gain: row.gain,
                  absoluteReturn: row.absoluteReturn,
                  cagr: row.cagr,
                  xirr: row.xirr,
                  iwellCode: row.iwellCode || match.iwellCode,
                  iwellCode2: row.iwellCode2 || match.iwellCode2,
                },
              });
            } else {
              const name = row.clientName;
              if (name) {
                const pan = row.pan ? row.pan.trim().toUpperCase() : null;
                const key = pan ? `pan:${pan}` : `name:${name.trim().toLowerCase()}`;
                if (!clientsToCreateMap.has(key)) {
                  clientsToCreateMap.set(key, {
                    name: name,
                    pan: pan,
                    iwellCode: row.iwellCode,
                    iwellCode2: row.iwellCode2,
                    balanceUnits: row.balanceUnits,
                    purchaseValue: row.purchaseValue,
                    currentValue: row.currentValue,
                    oneDayChange: row.oneDayChange,
                    dividend: row.dividend,
                    averageHoldingDays: row.averageHoldingDays,
                    gain: row.gain,
                    absoluteReturn: row.absoluteReturn,
                    cagr: row.cagr,
                    xirr: row.xirr,
                  });
                }
              }
            }
          }

          let updatedCount = 0;

          const updateChunkSize = 100;
          for (let i = 0; i < clientsToUpdate.length; i += updateChunkSize) {
            const chunk = clientsToUpdate.slice(i, i + updateChunkSize);
            await Promise.all(
              chunk.map((c) =>
                tx.existingClient.update({
                  where: { id: c.id },
                  data: c.data,
                }),
              ),
            );
            updatedCount += chunk.length;
          }

          const newClients = Array.from(clientsToCreateMap.values());
          if (newClients.length > 0) {
            const createChunkSize = 500;
            for (let i = 0; i < newClients.length; i += createChunkSize) {
              const chunk = newClients.slice(i, i + createChunkSize);
              const result = await tx.existingClient.createMany({
                data: chunk,
              });
              updatedCount += result.count;
            }
          }

          return updatedCount;
        },
        {
          timeout: 120000,
        },
      );

      res.status(201).json({
        success: true,
        message: `Successfully processed ${count} portfolio valuation records.`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/portfolio-valuations
router.get('/portfolio-valuations', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const search = ((req.query.search as string) || '').trim();

    const skip = (page - 1) * limit;

    const baseWhere: Prisma.ExistingClientWhereInput = {
      OR: [
        { balanceUnits: { not: null } },
        { purchaseValue: { not: null } },
        { currentValue: { not: null } },
      ],
    };

    if (search) {
      (baseWhere as any).AND = [
        {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { pan: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { iwellCode: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { iwellCode2: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.existingClient.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.existingClient.count({ where: baseWhere }),
    ]);

    const valuations = clients.map((c) => ({
      id: c.id,
      clientName: c.name,
      iwellCode: c.iwellCode,
      iwellCode2: c.iwellCode2,
      pan: c.pan,
      balanceUnits: c.balanceUnits,
      purchaseValue: c.purchaseValue,
      currentValue: c.currentValue,
      oneDayChange: c.oneDayChange,
      dividend: c.dividend,
      averageHoldingDays: c.averageHoldingDays,
      gain: c.gain,
      absoluteReturn: c.absoluteReturn,
      cagr: c.cagr,
      xirr: c.xirr,
      createdAt: c.createdAt,
    }));

    res.json({
      success: true,
      data: {
        valuations,
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

// DELETE /api/admin/portfolio-valuations/clear
router.delete('/portfolio-valuations/clear', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await prisma.existingClient.updateMany({
      data: {
        balanceUnits: null,
        purchaseValue: null,
        currentValue: null,
        oneDayChange: null,
        dividend: null,
        averageHoldingDays: null,
        gain: null,
        absoluteReturn: null,
        cagr: null,
        xirr: null,
      },
    });
    res.json({
      success: true,
      message: `Successfully cleared valuation fields for all ${result.count} client records.`,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
});

export default router;