import { Router } from 'express';
import type { Response, Request } from 'express';
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
import { auditCreate, auditDelete } from '../../services/audit';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Setup Multer
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

// GET /api/admin/existing-clients
router.get('/existing-clients', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const search = ((req.query.search as string) || '').trim();

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { pan: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { mobile: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { iwellCode: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { iwellCode2: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { city: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.existingClient.findMany({
        where,
        include: { folios: true } as any,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.existingClient.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        clients,
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

// DELETE /api/admin/existing-clients/clear
router.delete('/existing-clients/clear', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const result = await prisma.existingClient.deleteMany({});

    await auditDelete('ExistingClient', 'all', req.user!.id, {}, {
      adminId: req.user!.id,
      action: 'clear_all_existing_clients',
      count: result.count,
    });

    res.json({
      success: true,
      message: `Successfully cleared all ${result.count} existing client records.`,
      data: { count: result.count },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/existing-clients/:id
router.delete(
  '/existing-clients/:id',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid client ID format') })
        .parse(req.params);

      const deletedClient = await prisma.existingClient.delete({
        where: { id },
      });

      await auditDelete('ExistingClient', id, req.user!.id, deletedClient, {
        adminId: req.user!.id,
        action: 'delete_existing_client',
      });

      res.json({
        success: true,
        message: `Successfully deleted existing client ${deletedClient.name || id}.`,
        data: deletedClient,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/existing-clients/upload
const bulkImportConfirmSchema = z.object({
  confirm: z.boolean().optional(),
});

router.post(
  '/existing-clients/upload',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { confirm } = bulkImportConfirmSchema.parse(req.query);
      if (!confirm) {
        return next(ApiError.badRequest('This operation will delete all existing client records. Provide confirm=true query parameter to proceed.'));
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

      const parsedClients = rawRows.map((row) => ({
        title: String(getRowValue(row, ['Title', 'TITLE']) || '').trim() || null,
        name: String(getRowValue(row, ['Client Name', 'CLIENT NAME']) || '').trim() || null,
        pan: String(getRowValue(row, ['PAN Number', 'PAN', 'PAN NUMBER']) || '').trim().toUpperCase() || null,
        aadhaar: String(getRowValue(row, ['Aadhaar', 'AADHAAR']) || '').trim() || null,
        appCode: String(getRowValue(row, ['App Code', 'APP CODE']) || '').trim() || null,
        email: String(getRowValue(row, ['Email', 'EMAIL']) || '').trim() || null,
        disableEmail: String(getRowValue(row, ['Disable Email', 'DISABLE EMAIL']) || '').trim() || null,
        secondaryEmail: String(getRowValue(row, ['Secondary Email', 'SECONDARY EMAIL']) || '').trim() || null,
        iwellCode: String(getRowValue(row, ['IWELL Code', 'IWELL CODE']) || '').trim() || null,
        username: String(getRowValue(row, ['Username', 'USERNAME']) || '').trim() || null,
        mobile: String(getRowValue(row, ['Mobile', 'MOBILE']) || '').trim() || null,
        landline: String(getRowValue(row, ['Landline', 'LANDLINE']) || '').trim() || null,
        dob: String(getRowValue(row, ['Date of Birth', 'DATE OF BIRTH', 'DOB']) || '').trim() || null,
        birthdayWish: String(getRowValue(row, ['Birthday Wish', 'BIRTHDAY WISH']) || '').trim() || null,
        anniversary: String(getRowValue(row, ['Anniversary', 'ANNIVERSARY']) || '').trim() || null,
        dateOfDeath: String(getRowValue(row, ['Date of Death', 'DATE OF DEATH']) || '').trim() || null,
        familyHead: String(getRowValue(row, ['Family Head', 'FAMILY HEAD']) || '').trim() || null,
        familyHeadIwellCode: String(getRowValue(row, ['Family Head IWELL Code', 'FAMILY HEAD IWELL CODE']) || '').trim() || null,
        referredBy: String(getRowValue(row, ['Referred By', 'REFERRED BY']) || '').trim() || null,
        iwellCode2: String(getRowValue(row, ['IWELL Code 2', 'IWELLCODE2']) || '').trim() || null,
        familyHeadIwellCode2: String(getRowValue(row, ['Family Head IWELL Code 2', 'FAMILY HEAD IWELL CODE 2']) || '').trim() || null,
        address1: String(getRowValue(row, ['Address 1', 'ADDRESS 1']) || '').trim() || null,
        address2: String(getRowValue(row, ['Address 2', 'ADDRESS 2']) || '').trim() || null,
        address3: String(getRowValue(row, ['Address 3', 'ADDRESS 3']) || '').trim() || null,
        city: String(getRowValue(row, ['City', 'CITY']) || '').trim() || null,
        state: String(getRowValue(row, ['State', 'STATE']) || '').trim() || null,
        country: String(getRowValue(row, ['Country', 'COUNTRY']) || '').trim() || null,
        pinCode: String(getRowValue(row, ['Pin Code', 'PIN CODE']) || '').trim() || null,
        clientRating: String(getRowValue(row, ['Client Rating', 'CLIENT RATING']) || '').trim() || null,
        firstInvestmentDate: String(getRowValue(row, ['First Investment Date', 'FIRST INVESTMENT DATE']) || '').trim() || null,
        reviewFrequency: String(getRowValue(row, ['Review Frequency', 'REVIEW FREQUENCY']) || '').trim() || null,
        lastReviewDate: String(getRowValue(row, ['Last Review Date', 'LAST REVIEW DATE']) || '').trim() || null,
        modelName: String(getRowValue(row, ['Model Name', 'MODEL NAME']) || '').trim() || null,
        fileNumber: String(getRowValue(row, ['File Number', 'FILE NUMBER']) || '').trim() || null,
        tags: String(getRowValue(row, ['Tags', 'TAGS']) || '').trim() || null,
        updateLog: String(getRowValue(row, ['Update Log', 'UPDATE LOG']) || '').trim() || null,
        equityCode1: String(getRowValue(row, ['Equity Code 1', 'EQUITY CODE 1']) || '').trim() || null,
        equityCode2: String(getRowValue(row, ['Equity Code 2', 'EQUITY CODE 2']) || '').trim() || null,
        depository: String(getRowValue(row, ['Depository', 'DEPOSITORY']) || '').trim() || null,
        dpName: String(getRowValue(row, ['DP Name', 'DP NAME']) || '').trim() || null,
        dpId: String(getRowValue(row, ['DP ID', 'DP ID']) || '').trim() || null,
        npsAccountNumber: String(getRowValue(row, ['NPS Account Number', 'NPS ACCOUNT NUMBER']) || '').trim() || null,
        annualIncome: String(getRowValue(row, ['Annual Income', 'ANNUAL INCOME']) || '').trim() || null,
        profession: String(getRowValue(row, ['Profession', 'PROFESSION']) || '').trim() || null,
        billState: String(getRowValue(row, ['Bill State', 'BILL STATE']) || '').trim() || null,
        billGstin: String(getRowValue(row, ['Bill GSTIN', 'BILL GSTIN']) || '').trim() || null,
        aum: parseExcelNumber(getRowValue(row, ['AUM', 'Aum'])),
        targetSipAmount: parseExcelNumber(getRowValue(row, ['Target SIP Amount', 'TARGET SIP AMOUNT'])),
        targetElssAmount: parseExcelNumber(getRowValue(row, ['Target ELSS Amount', 'TARGET ELSS AMOUNT'])),
        targetEquityAllocation: parseExcelNumber(getRowValue(row, ['Target Equity Allocation', 'TARGET EQUITY ALLOCATION'])),
        targetDebtAllocation: parseExcelNumber(getRowValue(row, ['Target Debt Allocation', 'TARGET DEBT ALLOCATION'])),
        preferredBillingMode: String(getRowValue(row, ['Preferred Billing Mode', 'PREFERRED BILLING MODE']) || '').trim() || null,
        equityMfBilling: parseExcelNumber(getRowValue(row, ['Equity MF Billing', 'EQUITY MF BILLING'])),
        debtMfBilling: parseExcelNumber(getRowValue(row, ['Debt MF Billing', 'DEBT MF BILLING'])),
        sharesBilling: parseExcelNumber(getRowValue(row, ['Shares Billing', 'SHARES BILLING'])),
        bondsBilling: parseExcelNumber(getRowValue(row, ['Bonds Billing', 'BONDS BILLING'])),
        fixedDepositBilling: parseExcelNumber(getRowValue(row, ['Fixed Deposit Billing', 'FIXED DEPOSIT BILLING'])),
        otherAssetBilling: parseExcelNumber(getRowValue(row, ['Other Asset Billing', 'OTHER ASSET BILLING'])),
        remarks: String(getRowValue(row, ['Remarks', 'REMARKS']) || '').trim() || null,
        bankDetails: String(getRowValue(row, ['Bank Details', 'BANK DETAILS']) || '').trim() || null,
        overseasAddress1: String(getRowValue(row, ['Overseas Address 1', 'OVERSEAS ADDRESS 1']) || '').trim() || null,
        overseasAddress2: String(getRowValue(row, ['Overseas Address 2', 'OVERSEAS ADDRESS 2']) || '').trim() || null,
        overseasAddress3: String(getRowValue(row, ['Overseas Address 3', 'OVERSEAS ADDRESS 3']) || '').trim() || null,
        overseasCity: String(getRowValue(row, ['Overseas City', 'OVERSEAS CITY']) || '').trim() || null,
        overseasState: String(getRowValue(row, ['Overseas State', 'OVERSEAS STATE']) || '').trim() || null,
        overseasCountry: String(getRowValue(row, ['Overseas Country', 'OVERSEAS COUNTRY']) || '').trim() || null,
        overseasPin: String(getRowValue(row, ['Overseas PIN', 'OVERSEAS PIN']) || '').trim() || null,
        overseasPhone: String(getRowValue(row, ['Overseas Phone', 'OVERSEAS PHONE']) || '').trim() || null,
        overseasMobile: String(getRowValue(row, ['Overseas Mobile', 'OVERSEAS MOBILE']) || '').trim() || null,
        kycStatus: String(getRowValue(row, ['KYC Status', 'KYC STATUS']) || '').trim() || null,
        nominee1Name: String(getRowValue(row, ['Nominee 1 Name', 'NOMINEE 1 NAME']) || '').trim() || null,
        nominee1Relation: String(getRowValue(row, ['Nominee 1 Relation', 'NOMINEE 1 RELATION']) || '').trim() || null,
        nominee1Dob: String(getRowValue(row, ['Nominee 1 DOB', 'NOMINEE 1 DOB']) || '').trim() || null,
        nominee1Percentage: String(getRowValue(row, ['Nominee 1 Percentage', 'NOMINEE 1 PERCENTAGE']) || '').trim() || null,
        nominee2Name: String(getRowValue(row, ['Nominee 2 Name', 'NOMINEE 2 NAME']) || '').trim() || null,
        nominee2Relation: String(getRowValue(row, ['Nominee 2 Relation', 'NOMINEE 2 RELATION']) || '').trim() || null,
        nominee2Dob: String(getRowValue(row, ['Nominee 2 DOB', 'NOMINEE 2 DOB']) || '').trim() || null,
        nominee2Percentage: String(getRowValue(row, ['Nominee 2 Percentage', 'NOMINEE 2 PERCENTAGE']) || '').trim() || null,
        nominee3Name: String(getRowValue(row, ['Nominee 3 Name', 'NOMINEE 3 NAME']) || '').trim() || null,
        nominee3Relation: String(getRowValue(row, ['Nominee 3 Relation', 'NOMINEE 3 RELATION']) || '').trim() || null,
        nominee3Dob: String(getRowValue(row, ['Nominee 3 DOB', 'NOMINEE 3 DOB']) || '').trim() || null,
        nominee3Percentage: String(getRowValue(row, ['Nominee 3 Percentage', 'NOMINEE 3 PERCENTAGE']) || '').trim() || null,
      }));

      const count = await prisma.$transaction(
        async (tx) => {
          await tx.existingClient.deleteMany({});

          let insertedCount = 0;
          const chunkSize = 500;
          for (let i = 0; i < parsedClients.length; i += chunkSize) {
            const chunk = parsedClients.slice(i, i + chunkSize);
            const result = await tx.existingClient.createMany({
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

      await auditCreate('ExistingClient', 'bulk_upload', req.user!.id, {
        count,
      });

      res.status(201).json({
        success: true,
        message: `Successfully imported ${count} existing client records.`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;