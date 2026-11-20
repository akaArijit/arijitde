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

// GET /api/admin/folios
router.get('/folios', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const search = ((req.query.search as string) || '').trim();

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { clientName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { clientPan: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { folioNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { schemeName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { mobile: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [folios, total] = await Promise.all([
      prisma.folio.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.folio.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        folios,
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

// POST /api/admin/folios/upload
const bulkImportConfirmSchema = z.object({
  confirm: z.boolean().optional(),
});

router.post(
  '/folios/upload',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { confirm } = bulkImportConfirmSchema.parse(req.query);
      if (!confirm) {
        return next(ApiError.badRequest('This operation will delete all existing folio records. Provide confirm=true query parameter to proceed.'));
      }

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
        { name: 'Folio Number', aliases: ['Folio Number', 'Folio No', 'FOLIO NO', 'FOLIO NUMBER'] },
        { name: 'Scheme Name', aliases: ['Scheme Name', 'SCHEME NAME'] },
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

      const parsedFolios = rawRows.map((row) => ({
        clientName: String(getRowValue(row, ['Client Name', 'CLIENT NAME']) || '').trim() || null,
        clientPan: String(getRowValue(row, ['Client PAN', 'CLIENT PAN', 'ClientPan']) || '').trim() || null,
        clientAadhaar: String(getRowValue(row, ['Client Aadhaar', 'CLIENT AADHAAR', 'ClientAadhaar']) || '').trim() || null,
        nameAsPerFolio: String(getRowValue(row, ['Name as per Folio', 'Name as in Folio', 'NAME AS IN FOLIO', 'NAME AS PER FOLIO']) || '').trim() || null,
        panAsPerFolio: String(getRowValue(row, ['PAN as per Folio', 'PAN as in Folio', 'PAN AS IN FOLIO', 'PAN AS PER FOLIO']) || '').trim() || null,
        folioNumber: String(getRowValue(row, ['Folio Number', 'Folio No', 'FOLIO NO', 'FOLIO NUMBER']) || '').trim() || null,
        schemeName: String(getRowValue(row, ['Scheme Name', 'SCHEME NAME']) || '').trim() || null,
        units: parseExcelNumber(getRowValue(row, ['Units', 'UNITS'])),
        aum: parseExcelNumber(getRowValue(row, ['AUM', 'Aum'])),
        purchaseValue: parseExcelNumber(getRowValue(row, ['Purchase Value', 'PURCHASE VALUE', 'Invested Amount', 'Purchase Amount', 'Invested Value', 'Invested'])),
        email: String(getRowValue(row, ['Email', 'EMAIL']) || '').trim() || null,
        mobile: String(getRowValue(row, ['Mobile', 'MOBILE']) || '').trim() || null,
        dob: String(getRowValue(row, ['Date of Birth', 'DATE OF BIRTH', 'DOB']) || '').trim() || null,
        holding: String(getRowValue(row, ['Holding', 'HOLDING', 'Mode of Holding', 'MODE OF HOLDING']) || '').trim() || null,
        taxStatus: String(getRowValue(row, ['Tax Status', 'TAX STATUS']) || '').trim() || null,
        comments: String(getRowValue(row, ['Comments', 'COMMENTS']) || '').trim() || null,
        freezeDate: String(getRowValue(row, ['Freeze Date', 'FREEZE DATE']) || '').trim() || null,
        address1: String(getRowValue(row, ['Address 1', 'ADDRESS1']) || '').trim() || null,
        address2: String(getRowValue(row, ['Address 2', 'ADDRESS2']) || '').trim() || null,
        address3: String(getRowValue(row, ['Address 3', 'ADDRESS3']) || '').trim() || null,
        bankName: String(getRowValue(row, ['Bank Name', 'BANK NAME']) || '').trim() || null,
        bankAddress: String(getRowValue(row, ['Bank Address', 'BANK ADDRESS']) || '').trim() || null,
        accountNumber: String(getRowValue(row, ['Account Number', 'Account No', 'ACCOUNT NO', 'ACCOUNT NUMBER']) || '').trim() || null,
        ifscCode: String(getRowValue(row, ['IFSC Code', 'IFSC', 'Ifsc']) || '').trim() || null,
        accountType: String(getRowValue(row, ['Account Type', 'ACCOUNT TYPE']) || '').trim() || null,
        jointHolder1Name: String(getRowValue(row, ['Joint Holder 1 Name', 'Joint Holder 1', 'JOINT HOLDER 1', 'JOINT1 NAME']) || '').trim() || null,
        jointHolder1Pan: String(getRowValue(row, ['Joint Holder 1 PAN', 'JOINT1 PAN']) || '').trim() || null,
        jointHolder1Kyc: String(getRowValue(row, ['Joint Holder 1 KYC', 'JOINT1 KYC']) || '').trim() || null,
        jointHolder1Aadhaar: String(getRowValue(row, ['Joint Holder 1 Aadhaar', 'JOINT1 AADHAAR']) || '').trim() || null,
        jointHolder2Name: String(getRowValue(row, ['Joint Holder 2 Name', 'Joint Holder 2', 'JOINT HOLDER 2', 'JOINT2 NAME']) || '').trim() || null,
        jointHolder2Pan: String(getRowValue(row, ['Joint Holder 2 PAN', 'JOINT2 PAN']) || '').trim() || null,
        jointHolder2Kyc: String(getRowValue(row, ['Joint Holder 2 KYC', 'JOINT2 KYC']) || '').trim() || null,
        jointHolder2Aadhaar: String(getRowValue(row, ['Joint Holder 2 Aadhaar', 'JOINT2 AADHAAR']) || '').trim() || null,
        guardianName: String(getRowValue(row, ['Guardian Name', 'GUARDIAN NAME']) || '').trim() || null,
        guardianPan: String(getRowValue(row, ['Guardian PAN', 'GUARDIAN PAN']) || '').trim() || null,
        guardianKyc: String(getRowValue(row, ['Guardian KYC', 'GUARDIAN KYC']) || '').trim() || null,
        guardianAadhaar: String(getRowValue(row, ['Guardian Aadhaar', 'GUARDIAN AADHAAR']) || '').trim() || null,
        nomineeOpted: String(getRowValue(row, ['Nominee Opted', 'NOMINEE OPTED']) || '').trim() || null,
        nominee1Name: String(getRowValue(row, ['Nominee 1 Name', 'NOMINEE 1 NAME']) || '').trim() || null,
        nominee1Relation: String(getRowValue(row, ['Nominee 1 Relation', 'NOMINEE 1 RELATION']) || '').trim() || null,
        nominee1Percentage: String(getRowValue(row, ['Nominee 1 Percentage', 'NOMINEE 1 PERCENTAGE']) || '').trim() || null,
        nominee2Name: String(getRowValue(row, ['Nominee 2 Name', 'NOMINEE 2 NAME']) || '').trim() || null,
        nominee2Relation: String(getRowValue(row, ['Nominee 2 Relation', 'NOMINEE 2 RELATION']) || '').trim() || null,
        nominee2Percentage: String(getRowValue(row, ['Nominee 2 Percentage', 'NOMINEE 2 PERCENTAGE']) || '').trim() || null,
        nominee3Name: String(getRowValue(row, ['Nominee 3 Name', 'NOMINEE 3 NAME']) || '').trim() || null,
        nominee3Relation: String(getRowValue(row, ['Nominee 3 Relation', 'NOMINEE 3 RELATION']) || '').trim() || null,
        nominee3Percentage: String(getRowValue(row, ['Nominee 3 Percentage', 'NOMINEE 3 PERCENTAGE']) || '').trim() || null,
        ftFolio: String(getRowValue(row, ['FT Folio', 'FT FOLIO']) || '').trim() || null,
        folioType: String(getRowValue(row, ['Folio Type', 'FOLIO TYPE']) || '').trim() || null,
        clientDematId: String(getRowValue(row, ['Client Demat ID', 'CLIENT DEMAT ID']) || '').trim() || null,
        dpId: String(getRowValue(row, ['DP ID', 'DP ID']) || '').trim() || null,
        appCode: String(getRowValue(row, ['App Code', 'APP CODE']) || '').trim() || null,
        equityCode: String(getRowValue(row, ['Equity Code', 'EQUITY CODE']) || '').trim() || null,
        familyHead: String(getRowValue(row, ['Family Head', 'FAMILY HEAD']) || '').trim() || null,
        iwellCode: String(getRowValue(row, ['IWELL Code', 'IWELL CODE']) || '').trim() || null,
        iwellCode2: String(getRowValue(row, ['IWELL Code 2', 'IWELLCODE2']) || '').trim() || null,
        nomineeDetails: String(getRowValue(row, ['Nominee Details', 'NOMINEE DETAILS']) || '').trim() || null,
        nomineeDetails2: String(getRowValue(row, ['Nominee Details 2', 'NOMINEE DETAILS 2']) || '').trim() || null,
        nomineeDetails3: String(getRowValue(row, ['Nominee Details 3', 'NOMINEE DETAILS 3']) || '').trim() || null,
        operations: String(getRowValue(row, ['Operations', 'OPERATIONS']) || '').trim() || null,
        operationsCode: String(getRowValue(row, ['Operations Code', 'OPERATIONS CODE']) || '').trim() || null,
        relationshipManager: String(getRowValue(row, ['Relationship Manager', 'RELATIONSHIP MANAGER']) || '').trim() || null,
        relationshipManager2: String(getRowValue(row, ['Relationship Manager 2', 'RELATIONSHIP MANAGER 2']) || '').trim() || null,
        subBroker: String(getRowValue(row, ['Sub Broker', 'SUB BROKER']) || '').trim() || null,
        subBrokerCode: String(getRowValue(row, ['Sub Broker Code', 'SUB BROKER CODE']) || '').trim() || null,
        lastUsedArn: String(getRowValue(row, ['Last Used ARN', 'LAST USED ARN']) || '').trim() || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const count = await prisma.$transaction(
        async (tx) => {
          await tx.folio.deleteMany({});
          await tx.existingClient.deleteMany({});

          let insertedCount = 0;
          const chunkSize = 500;
          for (let i = 0; i < parsedFolios.length; i += chunkSize) {
            const chunk = parsedFolios.slice(i, i + chunkSize);
            const result = await tx.folio.createMany({
              data: chunk,
            });
            insertedCount += result.count;
          }
          return insertedCount;
        },
        {
          timeout: 120000,
        },
      );

      res.status(201).json({
        success: true,
        message: `Successfully imported ${count} folio records.`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/folios/clear
router.delete('/folios/clear', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { confirm } = z.object({ confirm: z.boolean().optional() }).parse(req.query);
    if (!confirm) {
      return next(ApiError.badRequest('This operation will delete all existing folio records. Provide confirm=true query parameter to proceed.'));
    }

    const result = await prisma.folio.deleteMany({});

    res.json({
      success: true,
      message: `Successfully cleared all ${result.count} folio records.`,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/folios/:id
router.delete(
  '/folios/:id',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid folio ID format') })
        .parse(req.params);

      await prisma.folio.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Successfully deleted folio record.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;