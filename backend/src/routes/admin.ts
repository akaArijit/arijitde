import { Router } from 'express';
import type { Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { Role, Prisma, LeadStatus } from '@prisma/client';
import { generateAdminBenchmarkReport } from '../services/benchmarking';
import { Timeframe } from '@finanalysis/shared';

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
    fileSize: 10 * 1024 * 1024, // 10MB limit for bulk CSV
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
  worksheet: XLSX.WorkSheet,
  headerIndicators: string[],
): number {
  const rawSheets = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
  for (let i = 0; i < rawSheets.length; i++) {
    const row = rawSheets[i];
    if (Array.isArray(row)) {
      const rowStrings = row.map((cell) =>
        String(cell || '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ''),
      );
      const found = headerIndicators.some((indicator) => {
        const cleanIndicator = indicator
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '');
        return rowStrings.includes(cleanIndicator);
      });
      if (found) {
        return i;
      }
    }
  }
  return 0;
}

function parseAvgHoldingDays(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).toLowerCase().trim();
  if (str === '') return null;

  // Case 1: Match "X years Y months" or "X yr Y mo"
  const yrMoRegex =
    /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)s?,?\s*(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)s?/;
  const yrMoMatch = str.match(yrMoRegex);
  if (yrMoMatch) {
    const yrs = parseFloat(yrMoMatch[1]);
    const mos = parseFloat(yrMoMatch[2]);
    return Math.round(yrs * 365 + mos * 30.417);
  }

  // Case 2: Match "Y months"
  const moRegex = /(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)s?/;
  if (str.includes('month') || str.includes('mo')) {
    const moMatch = str.match(moRegex);
    if (moMatch) {
      const mos = parseFloat(moMatch[1]);
      return Math.round(mos * 30.417);
    }
  }

  // Case 3: Match "X years" or "X yr"
  const yrRegex = /(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)s?/;
  if (str.includes('year') || str.includes('yr')) {
    const yrMatch = str.match(yrRegex);
    if (yrMatch) {
      const yrs = parseFloat(yrMatch[1]);
      return Math.round(yrs * 365);
    }
  }

  // Case 4: Plain number or contains "days"
  const clean = str.replace(/days?/g, '').replace(/,/g, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return null;

  // If the parsed number is small (<= 15), assume it represents years and convert to days
  if (num <= 15) {
    return Math.round(num * 365);
  }
  return num;
}

// Apply auth and admin middleware to all routes in this router
router.use(authMiddleware);
router.use(adminMiddleware);

// 1. GET /api/admin/stats
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
        pendingPayments: 0,
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

// 2. GET /api/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        pan: true,
        role: true,
        dob: true,
        anniversary: true,
        createdAt: true,
        assessments: {
          orderBy: { createdAt: 'desc' },
        },
        portfolios: {
          include: {
            score: true,
            rows: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
        },
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// 3. POST /api/admin/users/:id/role
const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

router.post(
  '/users/:id/role',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid user ID format') })
        .parse(req.params);
      const { role } = updateRoleSchema.parse(req.body);

      // Prevent admin from modifying their own role
      if (id === req.user!.id) {
        res.status(400).json({
          success: false,
          error: 'You cannot modify your own role.',
        });
        return;
      }

      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: { role },
        });

        if (role === Role.CLIENT) {
          // Upsert client profile
          await tx.client.upsert({
            where: { userId: id },
            update: {
              activatedAt: new Date(),
            },
            create: {
              userId: id,
              activatedAt: new Date(),
              advisorNotes: 'Manually promoted to Client by Admin',
              activePlan: 'PREMIUM',
            },
          });
        } else if (role === Role.GUEST) {
          // Remove client profile if role downgraded to guest
          const clientProfile = await tx.client.findUnique({
            where: { userId: id },
          });
          if (clientProfile) {
            await tx.client.delete({
              where: { userId: id },
            });
          }
        }

        return user;
      });

      res.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 4. POST /api/admin/users/:id/client-profile
const updateClientProfileSchema = z.object({
  advisorNotes: z.string().optional(),
  activePlan: z.string().optional(),
  pan: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().toUpperCase() : undefined))
    .refine(
      (val) =>
        val === undefined ||
        val === '' ||
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
      {
        message:
          'Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F) or empty to clear.',
      },
    ),
});

router.post(
  '/users/:id/client-profile',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid user ID format') })
        .parse(req.params);
      const { advisorNotes, activePlan, pan } = updateClientProfileSchema.parse(
        req.body,
      );

      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      if (pan !== undefined) {
        await prisma.user.update({
          where: { id },
          data: { pan: pan === '' ? null : pan },
        });
      }

      const clientProfile = await prisma.client.upsert({
        where: { userId: id },
        update: {
          advisorNotes,
          activePlan,
        },
        create: {
          userId: id,
          advisorNotes: advisorNotes || '',
          activePlan: activePlan || 'PREMIUM',
          activatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: clientProfile,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          res.status(400).json({
            success: false,
            error:
              'This PAN number is already assigned to another user account.',
          });
          return;
        }
      }
      next(error);
    }
  },
);

// 5. POST /api/admin/folios/upload
router.post(
  '/folios/upload',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const file = req.file;
      if (!file) {
        res
          .status(400)
          .json({ success: false, error: 'CSV/Excel file is required' });
        return;
      }

      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(file.buffer, { type: 'buffer' });
      } catch {
        res.status(400).json({
          success: false,
          error:
            'Invalid file format. Please upload a valid CSV or Excel file.',
        });
        return;
      }

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        res.status(400).json({ success: false, error: 'File sheet is empty' });
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      const headerRowIndex = findHeaderRowIndex(worksheet!, [
        'Client Name',
        'Name',
      ]);
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(
        worksheet!,
        {
          range: headerRowIndex,
          defval: '',
        },
      );

      if (rawRows.length === 0) {
        res
          .status(400)
          .json({ success: false, error: 'File contains no data rows' });
        return;
      }

      // Validate required headers
      const firstRow = rawRows[0] || {};
      const requiredFields = [
        { name: 'Client Name', aliases: ['Client Name', 'CLIENT NAME'] },
        {
          name: 'Folio Number',
          aliases: ['Folio Number', 'Folio No', 'FOLIO NO', 'FOLIO NUMBER'],
        },
        { name: 'Scheme Name', aliases: ['Scheme Name', 'SCHEME NAME'] },
      ];

      const missingKeys = [];
      for (const f of requiredFields) {
        const val = getRowValue(firstRow, f.aliases);
        if (val === undefined || String(val).trim() === '') {
          missingKeys.push(f.name);
        }
      }

      if (missingKeys.length > 0) {
        res.status(400).json({
          success: false,
          error: `Missing required CSV headers: ${missingKeys.join(', ')}`,
        });
        return;
      }

      // Parse all rows using getRowValue and aliases
      const parsedFolios = rawRows.map((row) => ({
        clientName:
          String(
            getRowValue(row, ['Client Name', 'CLIENT NAME']) || '',
          ).trim() || null,
        clientPan:
          String(
            getRowValue(row, ['Client PAN', 'CLIENT PAN', 'ClientPan']) || '',
          ).trim() || null,
        clientAadhaar:
          String(
            getRowValue(row, [
              'Client Aadhaar',
              'CLIENT AADHAAR',
              'ClientAadhaar',
            ]) || '',
          ).trim() || null,
        nameAsPerFolio:
          String(
            getRowValue(row, [
              'Name as per Folio',
              'Name as in Folio',
              'NAME AS IN FOLIO',
              'NAME AS PER FOLIO',
            ]) || '',
          ).trim() || null,
        panAsPerFolio:
          String(
            getRowValue(row, [
              'PAN as per Folio',
              'PAN as in Folio',
              'PAN AS IN FOLIO',
              'PAN AS PER FOLIO',
            ]) || '',
          ).trim() || null,
        folioNumber:
          String(
            getRowValue(row, [
              'Folio Number',
              'Folio No',
              'FOLIO NO',
              'FOLIO NUMBER',
            ]) || '',
          ).trim() || null,
        schemeName:
          String(
            getRowValue(row, ['Scheme Name', 'SCHEME NAME']) || '',
          ).trim() || null,
        units: parseExcelNumber(getRowValue(row, ['Units', 'UNITS'])),
        aum: parseExcelNumber(getRowValue(row, ['AUM', 'Aum'])),
        purchaseValue: parseExcelNumber(
          getRowValue(row, [
            'Purchase Value',
            'PURCHASE VALUE',
            'Invested Amount',
            'Purchase Amount',
            'Invested Value',
            'Invested',
          ]),
        ),
        email:
          String(getRowValue(row, ['Email', 'EMAIL']) || '').trim() || null,
        mobile:
          String(getRowValue(row, ['Mobile', 'MOBILE']) || '').trim() || null,
        dob:
          String(
            getRowValue(row, ['Date of Birth', 'DATE OF BIRTH', 'DOB']) || '',
          ).trim() || null,
        holding:
          String(
            getRowValue(row, [
              'Holding',
              'HOLDING',
              'Mode of Holding',
              'MODE OF HOLDING',
            ]) || '',
          ).trim() || null,
        taxStatus:
          String(getRowValue(row, ['Tax Status', 'TAX STATUS']) || '').trim() ||
          null,
        comments:
          String(getRowValue(row, ['Comments', 'COMMENTS']) || '').trim() ||
          null,
        freezeDate:
          String(
            getRowValue(row, ['Freeze Date', 'FREEZE DATE']) || '',
          ).trim() || null,
        address1:
          String(getRowValue(row, ['Address 1', 'ADDRESS1']) || '').trim() ||
          null,
        address2:
          String(getRowValue(row, ['Address 2', 'ADDRESS2']) || '').trim() ||
          null,
        address3:
          String(getRowValue(row, ['Address 3', 'ADDRESS3']) || '').trim() ||
          null,
        bankName:
          String(getRowValue(row, ['Bank Name', 'BANK NAME']) || '').trim() ||
          null,
        bankAddress:
          String(
            getRowValue(row, ['Bank Address', 'BANK ADDRESS']) || '',
          ).trim() || null,
        accountNumber:
          String(
            getRowValue(row, [
              'Account Number',
              'Account No',
              'ACCOUNT NO',
              'ACCOUNT NUMBER',
            ]) || '',
          ).trim() || null,
        ifscCode:
          String(
            getRowValue(row, ['IFSC Code', 'IFSC', 'Ifsc']) || '',
          ).trim() || null,
        accountType:
          String(
            getRowValue(row, ['Account Type', 'ACCOUNT TYPE']) || '',
          ).trim() || null,
        jointHolder1Name:
          String(
            getRowValue(row, [
              'Joint Holder 1 Name',
              'Joint Holder 1',
              'JOINT HOLDER 1',
              'JOINT1 NAME',
            ]) || '',
          ).trim() || null,
        jointHolder1Pan:
          String(
            getRowValue(row, ['Joint Holder 1 PAN', 'JOINT1 PAN']) || '',
          ).trim() || null,
        jointHolder1Kyc:
          String(
            getRowValue(row, ['Joint Holder 1 KYC', 'JOINT1 KYC']) || '',
          ).trim() || null,
        jointHolder1Aadhaar:
          String(
            getRowValue(row, ['Joint Holder 1 Aadhaar', 'JOINT1 AADHAAR']) ||
              '',
          ).trim() || null,
        jointHolder2Name:
          String(
            getRowValue(row, [
              'Joint Holder 2 Name',
              'Joint Holder 2',
              'JOINT HOLDER 2',
              'JOINT2 NAME',
            ]) || '',
          ).trim() || null,
        jointHolder2Pan:
          String(
            getRowValue(row, ['Joint Holder 2 PAN', 'JOINT2 PAN']) || '',
          ).trim() || null,
        jointHolder2Kyc:
          String(
            getRowValue(row, ['Joint Holder 2 KYC', 'JOINT2 KYC']) || '',
          ).trim() || null,
        jointHolder2Aadhaar:
          String(
            getRowValue(row, ['Joint Holder 2 Aadhaar', 'JOINT2 AADHAAR']) ||
              '',
          ).trim() || null,
        guardianName:
          String(
            getRowValue(row, ['Guardian Name', 'GUARDIAN NAME']) || '',
          ).trim() || null,
        guardianPan:
          String(
            getRowValue(row, ['Guardian PAN', 'GUARDIAN PAN']) || '',
          ).trim() || null,
        guardianKyc:
          String(
            getRowValue(row, ['Guardian KYC', 'GUARDIAN KYC']) || '',
          ).trim() || null,
        guardianAadhaar:
          String(
            getRowValue(row, ['Guardian Aadhaar', 'GUARDIAN AADHAAR']) || '',
          ).trim() || null,
        nomineeOpted:
          String(
            getRowValue(row, [
              'Nominee Opted',
              'Nominee Opted Out',
              'NOMINEE OPTED OUT',
            ]) || '',
          ).trim() || null,
        nominee1Name:
          String(
            getRowValue(row, ['Nominee 1 Name', 'NOMINEE 1 NAME']) || '',
          ).trim() || null,
        nominee1Relation:
          String(
            getRowValue(row, ['Nominee 1 Relation', 'NOMINEE 1 RELATION']) ||
              '',
          ).trim() || null,
        nominee1Percentage:
          String(
            getRowValue(row, [
              'Nominee 1 Percentage',
              'NOMINEE 1 PERCENTAGE',
            ]) || '',
          ).trim() || null,
        nominee2Name:
          String(
            getRowValue(row, ['Nominee 2 Name', 'NOMINEE 2 NAME']) || '',
          ).trim() || null,
        nominee2Relation:
          String(
            getRowValue(row, ['Nominee 2 Relation', 'NOMINEE 2 RELATION']) ||
              '',
          ).trim() || null,
        nominee2Percentage:
          String(
            getRowValue(row, [
              'Nominee 2 Percentage',
              'NOMINEE 2 PERCENTAGE',
            ]) || '',
          ).trim() || null,
        nominee3Name:
          String(
            getRowValue(row, ['Nominee 3 Name', 'NOMINEE 3 NAME']) || '',
          ).trim() || null,
        nominee3Relation:
          String(
            getRowValue(row, ['Nominee 3 Relation', 'NOMINEE 3 RELATION']) ||
              '',
          ).trim() || null,
        nominee3Percentage:
          String(
            getRowValue(row, [
              'Nominee 3 Percentage',
              'NOMINEE 3 PERCENTAGE',
            ]) || '',
          ).trim() || null,
        ftFolio:
          String(getRowValue(row, ['FT Folio', 'FT FOLIO']) || '').trim() ||
          null,
        folioType:
          String(getRowValue(row, ['Folio Type', 'FOLIO TYPE']) || '').trim() ||
          null,
        clientDematId:
          String(
            getRowValue(row, ['Client Demat ID', 'CLIENT DEMAT ID']) || '',
          ).trim() || null,
        dpId: String(getRowValue(row, ['DP ID', 'DP ID']) || '').trim() || null,
        appCode:
          String(getRowValue(row, ['App Code', 'APP CODE']) || '').trim() ||
          null,
        equityCode:
          String(
            getRowValue(row, ['Equity Code', 'EQUITY CODE']) || '',
          ).trim() || null,
        familyHead:
          String(
            getRowValue(row, ['Family Head', 'FAMILY HEAD']) || '',
          ).trim() || null,
        iwellCode:
          String(getRowValue(row, ['IWELL Code', 'IWELL CODE']) || '').trim() ||
          null,
        iwellCode2:
          String(
            getRowValue(row, ['IWELL Code 2', 'IWELLCODE2']) || '',
          ).trim() || null,
        nomineeDetails:
          String(
            getRowValue(row, ['Nominee Details', 'NOMINEE DETAILS1']) || '',
          ).trim() || null,
        nomineeDetails2:
          String(
            getRowValue(row, ['Nominee Details 2', 'NOMINEE DETAILS2']) || '',
          ).trim() || null,
        nomineeDetails3:
          String(
            getRowValue(row, ['Nominee Details 3', 'NOMINEE DETAILS3']) || '',
          ).trim() || null,
        operations:
          String(getRowValue(row, ['Operations', 'OPERATIONS']) || '').trim() ||
          null,
        operationsCode:
          String(
            getRowValue(row, ['Operations Code', 'OPERATIONS CODE']) || '',
          ).trim() || null,
        relationshipManager:
          String(
            getRowValue(row, [
              'Relationship Manager',
              'RELATIONSHIP  MANAGER',
            ]) || '',
          ).trim() || null,
        relationshipManager2:
          String(
            getRowValue(row, [
              'Relationship Manager 2',
              'RELATIONSHIP  MANAGER 2',
            ]) || '',
          ).trim() || null,
        subBroker:
          String(
            getRowValue(row, ['Sub Broker', 'SUB  BROKER']) || '',
          ).trim() || null,
        subBrokerCode:
          String(
            getRowValue(row, ['Sub Broker Code', 'SUB  BROKER CODE']) || '',
          ).trim() || null,
        lastUsedArn:
          String(
            getRowValue(row, ['Last Used ARN', 'LAST USED ARN']) || '',
          ).trim() || null,
      }));

      // Save using a transaction with matching and linking to existing clients
      const count = await prisma.$transaction(
        async (tx) => {
          // 1. Clean existing folio database before import
          await tx.folio.deleteMany({});

          // 2. Fetch all existing clients for matching
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

          // 3. Find which rows require creating a new client, and collect unique new clients to prevent duplicates
          const newClientsToInsertMap = new Map<string, any>();

          for (const row of parsedFolios) {
            let match = null;
            if (row.clientPan) {
              match = clientByPan.get(row.clientPan.trim().toUpperCase());
            }
            if (!match && row.panAsPerFolio) {
              match = clientByPan.get(row.panAsPerFolio.trim().toUpperCase());
            }
            if (!match && row.clientName) {
              match = clientByName.get(row.clientName.trim().toLowerCase());
            }
            if (!match && row.nameAsPerFolio) {
              match = clientByName.get(row.nameAsPerFolio.trim().toLowerCase());
            }

            if (!match) {
              const name = row.clientName || row.nameAsPerFolio;
              if (name) {
                const pan = row.clientPan
                  ? row.clientPan.trim().toUpperCase()
                  : row.panAsPerFolio
                    ? row.panAsPerFolio.trim().toUpperCase()
                    : null;
                const key = pan
                  ? `pan:${pan}`
                  : `name:${name.trim().toLowerCase()}`;
                if (!newClientsToInsertMap.has(key)) {
                  newClientsToInsertMap.set(key, {
                    name: name,
                    pan: pan,
                    email: row.email,
                    mobile: row.mobile,
                    dob: row.dob,
                    address1: row.address1,
                    address2: row.address2,
                    address3: row.address3,
                    aadhaar: row.clientAadhaar,
                    nominee1Name: row.nominee1Name,
                    nominee1Relation: row.nominee1Relation,
                    nominee1Percentage: row.nominee1Percentage,
                    nominee2Name: row.nominee2Name,
                    nominee2Relation: row.nominee2Relation,
                    nominee2Percentage: row.nominee2Percentage,
                    nominee3Name: row.nominee3Name,
                    nominee3Relation: row.nominee3Relation,
                    nominee3Percentage: row.nominee3Percentage,
                    appCode: row.appCode,
                    iwellCode: row.iwellCode,
                    iwellCode2: row.iwellCode2,
                    familyHead: row.familyHead,
                    dpId: row.dpId,
                    aum: row.aum,
                  });
                }
              }
            }
          }

          // 4. Bulk insert new clients in chunks
          const newClients = Array.from(newClientsToInsertMap.values());
          if (newClients.length > 0) {
            const chunkSize = 500;
            for (let i = 0; i < newClients.length; i += chunkSize) {
              await tx.existingClient.createMany({
                data: newClients.slice(i, i + chunkSize),
              });
            }
          }

          // 5. Re-fetch all clients to rebuild maps containing newly created clients
          const allClients = await tx.existingClient.findMany({});
          clientByPan.clear();
          clientByName.clear();
          for (const c of allClients) {
            if (c.pan) {
              clientByPan.set(c.pan.trim().toUpperCase(), c);
            }
            if (c.name) {
              clientByName.set(c.name.trim().toLowerCase(), c);
            }
          }

          // 6. Map each folio to its matched client ID
          const foliosToInsert = parsedFolios.map((row) => {
            let match = null;
            if (row.clientPan) {
              match = clientByPan.get(row.clientPan.trim().toUpperCase());
            }
            if (!match && row.panAsPerFolio) {
              match = clientByPan.get(row.panAsPerFolio.trim().toUpperCase());
            }
            if (!match && row.clientName) {
              match = clientByName.get(row.clientName.trim().toLowerCase());
            }
            if (!match && row.nameAsPerFolio) {
              match = clientByName.get(row.nameAsPerFolio.trim().toLowerCase());
            }

            return {
              clientName: row.clientName,
              clientPan: row.clientPan,
              clientAadhaar: row.clientAadhaar,
              nameAsPerFolio: row.nameAsPerFolio,
              panAsPerFolio: row.panAsPerFolio,
              folioNumber: row.folioNumber,
              schemeName: row.schemeName,
              units: row.units,
              aum: row.aum,
              purchaseValue: row.purchaseValue,
              email: row.email,
              mobile: row.mobile,
              dob: row.dob,
              holding: row.holding,
              taxStatus: row.taxStatus,
              comments: row.comments,
              freezeDate: row.freezeDate,
              address1: row.address1,
              address2: row.address2,
              address3: row.address3,
              bankName: row.bankName,
              bankAddress: row.bankAddress,
              accountNumber: row.accountNumber,
              ifscCode: row.ifscCode,
              accountType: row.accountType,
              jointHolder1Name: row.jointHolder1Name,
              jointHolder1Pan: row.jointHolder1Pan,
              jointHolder1Kyc: row.jointHolder1Kyc,
              jointHolder1Aadhaar: row.jointHolder1Aadhaar,
              jointHolder2Name: row.jointHolder2Name,
              jointHolder2Pan: row.jointHolder2Pan,
              jointHolder2Kyc: row.jointHolder2Kyc,
              jointHolder2Aadhaar: row.jointHolder2Aadhaar,
              guardianName: row.guardianName,
              guardianPan: row.guardianPan,
              guardianKyc: row.guardianKyc,
              guardianAadhaar: row.guardianAadhaar,
              nomineeOpted: row.nomineeOpted,
              nominee1Name: row.nominee1Name,
              nominee1Relation: row.nominee1Relation,
              nominee1Percentage: row.nominee1Percentage,
              nominee2Name: row.nominee2Name,
              nominee2Relation: row.nominee2Relation,
              nominee2Percentage: row.nominee2Percentage,
              nominee3Name: row.nominee3Name,
              nominee3Relation: row.nominee3Relation,
              nominee3Percentage: row.nominee3Percentage,
              ftFolio: row.ftFolio,
              folioType: row.folioType,
              clientDematId: row.clientDematId,
              dpId: row.dpId,
              appCode: row.appCode,
              equityCode: row.equityCode,
              familyHead: row.familyHead,
              iwellCode: row.iwellCode,
              iwellCode2: row.iwellCode2,
              nomineeDetails: row.nomineeDetails,
              nomineeDetails2: row.nomineeDetails2,
              nomineeDetails3: row.nomineeDetails3,
              operations: row.operations,
              operationsCode: row.operationsCode,
              relationshipManager: row.relationshipManager,
              relationshipManager2: row.relationshipManager2,
              subBroker: row.subBroker,
              subBrokerCode: row.subBrokerCode,
              lastUsedArn: row.lastUsedArn,
              existingClientId: match ? match.id : null,
            };
          });

          // 7. Bulk insert folios in chunks
          let insertedCount = 0;
          const chunkSize = 500;
          for (let i = 0; i < foliosToInsert.length; i += chunkSize) {
            const chunk = foliosToInsert.slice(i, i + chunkSize);
            const result = await tx.folio.createMany({
              data: chunk as any,
            });
            insertedCount += result.count;
          }

          return insertedCount;
        },
        {
          timeout: 120000, // 120 seconds timeout for larger transactions
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
  },
);

// 6. GET /api/admin/folios
router.get(
  '/folios',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const search = ((req.query.search as string) || '').trim();

      const skip = (page - 1) * limit;

      const where: Prisma.FolioWhereInput = search
        ? {
            OR: [
              { clientName: { contains: search, mode: 'insensitive' } },
              { clientPan: { contains: search, mode: 'insensitive' } },
              { folioNumber: { contains: search, mode: 'insensitive' } },
              { schemeName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { mobile: { contains: search, mode: 'insensitive' } },
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
  },
);

// 7. DELETE /api/admin/folios/clear
router.delete(
  '/folios/clear',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await prisma.folio.deleteMany({});
      res.json({
        success: true,
        message: `Successfully cleared all ${result.count} folio records.`,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  },
);

// 8. POST /api/admin/existing-clients/upload
router.post(
  '/existing-clients/upload',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const file = req.file;
      if (!file) {
        res
          .status(400)
          .json({ success: false, error: 'CSV/Excel file is required' });
        return;
      }

      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(file.buffer, { type: 'buffer' });
      } catch {
        res.status(400).json({
          success: false,
          error:
            'Invalid file format. Please upload a valid CSV or Excel file.',
        });
        return;
      }

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        res.status(400).json({ success: false, error: 'File sheet is empty' });
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      const headerRowIndex = findHeaderRowIndex(worksheet!, ['Name', 'PAN']);
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(
        worksheet!,
        {
          range: headerRowIndex,
          defval: '',
        },
      );

      if (rawRows.length === 0) {
        res
          .status(400)
          .json({ success: false, error: 'File contains no data rows' });
        return;
      }

      // Validate required headers
      const firstRow = rawRows[0] || {};
      const requiredFields = [
        { name: 'Name', aliases: ['Name', 'NAME'] },
        { name: 'PAN', aliases: ['PAN', 'Pan'] },
      ];

      const missingKeys = [];
      for (const f of requiredFields) {
        const val = getRowValue(firstRow, f.aliases);
        if (val === undefined || String(val).trim() === '') {
          missingKeys.push(f.name);
        }
      }

      if (missingKeys.length > 0) {
        res.status(400).json({
          success: false,
          error: `Missing required CSV headers: ${missingKeys.join(', ')}`,
        });
        return;
      }

      // Parse all rows using getRowValue and aliases
      const parsedClients = rawRows.map((row) => ({
        title:
          String(
            getRowValue(row, ['Title (Mr./Mrs./Ms.)', 'Title', 'TITLE']) || '',
          ).trim() || null,
        name: String(getRowValue(row, ['Name', 'NAME']) || '').trim() || null,
        pan: String(getRowValue(row, ['PAN', 'Pan']) || '').trim() || null,
        appCode:
          String(
            getRowValue(row, ['App Code', 'APP CODE', 'APPCODE']) || '',
          ).trim() || null,
        email:
          String(getRowValue(row, ['Email', 'EMAIL']) || '').trim() || null,
        disableEmail:
          String(
            getRowValue(row, [
              'Disable Email',
              'Disable Emails',
              'DISABLE EMAIL',
              'DISABLE EMAILS',
            ]) || '',
          ).trim() || null,
        secondaryEmail:
          String(
            getRowValue(row, ['Secondary Email', 'SECONDARY EMAIL']) || '',
          ).trim() || null,
        iwellCode:
          String(getRowValue(row, ['IWELL Code', 'IWELL CODE']) || '').trim() ||
          null,
        username:
          String(getRowValue(row, ['Username', 'USERNAME']) || '').trim() ||
          null,
        mobile:
          String(getRowValue(row, ['Mobile', 'MOBILE']) || '').trim() || null,
        landline:
          String(getRowValue(row, ['Landline', 'LANDLINE']) || '').trim() ||
          null,
        dob:
          String(
            getRowValue(row, ['Date of Birth', 'DATE OF BIRTH', 'DOB']) || '',
          ).trim() || null,
        birthdayWish:
          String(
            getRowValue(row, ['Birthday Wish', 'BIRTHDAY WISH']) || '',
          ).trim() || null,
        anniversary:
          String(
            getRowValue(row, ['Anniversary', 'ANNIVERSARY']) || '',
          ).trim() || null,
        dateOfDeath:
          String(
            getRowValue(row, ['Date of Death', 'DATE OF DEATH']) || '',
          ).trim() || null,
        familyHead:
          String(
            getRowValue(row, ['Family Head', 'FAMILY HEAD']) || '',
          ).trim() || null,
        familyHeadIwellCode:
          String(
            getRowValue(row, [
              'Family Head IWELL Code',
              'FAMILY HEAD IWELL CODE',
            ]) || '',
          ).trim() || null,
        referredBy:
          String(
            getRowValue(row, ['Referred By', 'Referred By']) || '',
          ).trim() || null,
        iwellCode2:
          String(
            getRowValue(row, ['IWELL Code 2', 'IWELL CODE 2', 'IWELL CODE2']) ||
              '',
          ).trim() || null,
        familyHeadIwellCode2:
          String(
            getRowValue(row, [
              'Family Head IWELL Code 2',
              'FAMILY HEAD IWELL CODE 2',
            ]) || '',
          ).trim() || null,
        address1:
          String(getRowValue(row, ['Address 1', 'ADDRESS1']) || '').trim() ||
          null,
        address2:
          String(getRowValue(row, ['Address 2', 'ADDRESS2']) || '').trim() ||
          null,
        address3:
          String(getRowValue(row, ['Address 3', 'ADDRESS3']) || '').trim() ||
          null,
        city: String(getRowValue(row, ['City', 'CITY']) || '').trim() || null,
        state:
          String(getRowValue(row, ['State', 'STATE']) || '').trim() || null,
        country:
          String(getRowValue(row, ['Country', 'COUNTRY']) || '').trim() || null,
        pinCode:
          String(
            getRowValue(row, ['PIN Code', 'PIN', 'PIN CODE']) || '',
          ).trim() || null,
        clientRating:
          String(
            getRowValue(row, ['Client Rating', 'CLIENT RATING']) || '',
          ).trim() || null,
        firstInvestmentDate:
          String(
            getRowValue(row, [
              'First Investment Date',
              'First Investment Date',
            ]) || '',
          ).trim() || null,
        reviewFrequency:
          String(
            getRowValue(row, ['Review Frequency', 'REVIEW FREQUENCY']) || '',
          ).trim() || null,
        lastReviewDate:
          String(
            getRowValue(row, ['Last Review Date', 'LAST REVIEW DATE']) || '',
          ).trim() || null,
        modelName:
          String(getRowValue(row, ['Model Name', 'MODEL NAME']) || '').trim() ||
          null,
        fileNumber:
          String(
            getRowValue(row, ['File Number', 'FILE NUMBER', 'FILE NO']) || '',
          ).trim() || null,
        tags: String(getRowValue(row, ['Tags', 'TAGS']) || '').trim() || null,
        updateLog:
          String(
            getRowValue(row, ['Update Log', 'UPDATE LOCK', 'UPDATE LOG']) || '',
          ).trim() || null,
        equityCode1:
          String(
            getRowValue(row, ['Equity Code 1', 'EQUITY CODE1']) || '',
          ).trim() || null,
        equityCode2:
          String(
            getRowValue(row, ['Equity Code 2', 'EQUITY CODE2']) || '',
          ).trim() || null,
        depository:
          String(getRowValue(row, ['Depository', 'DEPOSITORY']) || '').trim() ||
          null,
        dpName:
          String(getRowValue(row, ['DP Name', 'DP NAME']) || '').trim() || null,
        dpId: String(getRowValue(row, ['DP ID', 'DP ID']) || '').trim() || null,
        npsAccountNumber:
          String(
            getRowValue(row, [
              'NPS Account Number',
              'NPS A/c No',
              'NPS ACCOUNT NUMBER',
            ]) || '',
          ).trim() || null,
        annualIncome:
          String(
            getRowValue(row, ['Annual Income', 'ANNUAL INCOME']) || '',
          ).trim() || null,
        profession:
          String(
            getRowValue(row, [
              'Profession',
              'PROFESSION',
              'OCCUPATION',
              'Occupation',
            ]) || '',
          ).trim() || null,
        billState:
          String(getRowValue(row, ['Bill State', 'Bill State']) || '').trim() ||
          null,
        billGstin:
          String(getRowValue(row, ['Bill GSTIN', 'Bill GSTIN']) || '').trim() ||
          null,
        aum: parseExcelNumber(getRowValue(row, ['AUM', 'Aum'])),
        targetSipAmount: parseExcelNumber(
          getRowValue(row, [
            'Target SIP Amount',
            'Target SIP Amout',
            'Target SIP Amount',
          ]),
        ),
        targetElssAmount: parseExcelNumber(
          getRowValue(row, ['Target ELSS Amount', 'Target ELSS Amount']),
        ),
        targetEquityAllocation: parseExcelNumber(
          getRowValue(row, [
            'Target Equity Allocation (%)',
            'Target Equity Allocation',
          ]),
        ),
        targetDebtAllocation: parseExcelNumber(
          getRowValue(row, [
            'Target Debt Allocation (%)',
            'Target Debt Allocation',
          ]),
        ),
        preferredBillingMode:
          String(
            getRowValue(row, [
              'Preferred Billing Mode',
              'Preferred Billing mode',
            ]) || '',
          ).trim() || null,
        equityMfBilling: parseExcelNumber(
          getRowValue(row, ['Equity MF Billing (%)', 'Equity MF Billing']),
        ),
        debtMfBilling: parseExcelNumber(
          getRowValue(row, ['Debt MF Billing (%)', 'Debt MF Billing']),
        ),
        sharesBilling: parseExcelNumber(
          getRowValue(row, ['Shares Billing (%)', 'Shares Billing']),
        ),
        bondsBilling: parseExcelNumber(
          getRowValue(row, ['Bonds Billing (%)', 'Bonds Billing']),
        ),
        fixedDepositBilling: parseExcelNumber(
          getRowValue(row, [
            'Fixed Deposit Billing (%)',
            'Fixed Income Billing (%)',
            'Fixed Deposit Billing',
          ]),
        ),
        otherAssetBilling: parseExcelNumber(
          getRowValue(row, [
            'Other Asset Billing (%)',
            'Other Assets Billing (%)',
            'Other Asset Billing',
          ]),
        ),
        remarks:
          String(getRowValue(row, ['Remarks', 'REMARKS']) || '').trim() || null,
        bankDetails:
          String(
            getRowValue(row, ['Bank Details', 'BANK DETAILS']) || '',
          ).trim() || null,
        overseasAddress1:
          String(
            getRowValue(row, ['Overseas Address 1', 'OS ADDRESS1']) || '',
          ).trim() || null,
        overseasAddress2:
          String(
            getRowValue(row, ['Overseas Address 2', 'OS ADDRESS2']) || '',
          ).trim() || null,
        overseasAddress3:
          String(
            getRowValue(row, ['Overseas Address 3', 'OS ADDRESS3']) || '',
          ).trim() || null,
        overseasCity:
          String(
            getRowValue(row, ['Overseas City', 'OVERSEAS CITY']) || '',
          ).trim() || null,
        overseasState:
          String(
            getRowValue(row, ['Overseas State', 'OVERSEAS STATE']) || '',
          ).trim() || null,
        overseasCountry:
          String(
            getRowValue(row, ['Overseas Country', 'OVERSEAS COUNTRY']) || '',
          ).trim() || null,
        overseasPin:
          String(
            getRowValue(row, [
              'Overseas PIN',
              'Overseas PIN',
              'OVERSEAS PIN',
            ]) || '',
          ).trim() || null,
        overseasPhone:
          String(
            getRowValue(row, ['Overseas Phone', 'OVERSEAS PHONE']) || '',
          ).trim() || null,
        overseasMobile:
          String(
            getRowValue(row, ['Overseas Mobile', 'OVERSEAS MOBILE']) || '',
          ).trim() || null,
        kycStatus:
          String(
            getRowValue(row, ['KYC Status', 'KYC STATUS', 'KYC']) || '',
          ).trim() || null,
        aadhaar:
          String(getRowValue(row, ['Aadhaar', 'AADHAAR']) || '').trim() || null,
        nominee1Name:
          String(
            getRowValue(row, [
              'Nominee 1 Name',
              'NOMINEE 1 NAME',
              'Nominee Details',
            ]) || '',
          ).trim() || null,
        nominee1Relation:
          String(
            getRowValue(row, ['Nominee 1 Relation', 'NOMINEE 1 RELATION']) ||
              '',
          ).trim() || null,
        nominee1Dob:
          String(
            getRowValue(row, [
              'Nominee 1 DOB',
              'NOMINEE 1 DOB',
              'Nominee 1 Dob',
            ]) || '',
          ).trim() || null,
        nominee1Percentage:
          String(
            getRowValue(row, [
              'Nominee 1 Percentage',
              'NOMINEE 1 PERCENTAGE',
            ]) || '',
          ).trim() || null,
        nominee2Name:
          String(
            getRowValue(row, ['Nominee 2 Name', 'NOMINEE 2 NAME']) || '',
          ).trim() || null,
        nominee2Relation:
          String(
            getRowValue(row, ['Nominee 2 Relation', 'NOMINEE 2 RELATION']) ||
              '',
          ).trim() || null,
        nominee2Dob:
          String(
            getRowValue(row, ['Nominee 2 DOB', 'NOMINEE 2 DOB']) || '',
          ).trim() || null,
        nominee2Percentage:
          String(
            getRowValue(row, [
              'Nominee 2 Percentage',
              'NOMINEE 2 PERCENTAGE',
            ]) || '',
          ).trim() || null,
        nominee3Name:
          String(
            getRowValue(row, ['Nominee 3 Name', 'NOMINEE 3 NAME']) || '',
          ).trim() || null,
        nominee3Relation:
          String(
            getRowValue(row, ['Nominee 3 Relation', 'NOMINEE 3 RELATION']) ||
              '',
          ).trim() || null,
        nominee3Dob:
          String(
            getRowValue(row, ['Nominee 3 DOB', 'NOMINEE 3 DOB']) || '',
          ).trim() || null,
        nominee3Percentage:
          String(
            getRowValue(row, [
              'Nominee 3 Percentage',
              'NOMINEE 3 PERCENTAGE',
            ]) || '',
          ).trim() || null,
      }));

      // Save using a transaction with chunking to prevent PostgreSQL parameter limits
      const count = await prisma.$transaction(
        async (tx) => {
          // Clean existing folio database first to prevent foreign-key constraint violations
          await tx.folio.deleteMany({});

          // Clean existing client database before import
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
          timeout: 120000, // 120 seconds timeout for larger transactions
        },
      );

      res.status(201).json({
        success: true,
        message: `Successfully imported ${count} existing client records.`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  },
);

// 9. GET /api/admin/existing-clients
router.get(
  '/existing-clients',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const search = ((req.query.search as string) || '').trim();

      const skip = (page - 1) * limit;

      const where: Prisma.ExistingClientWhereInput = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { pan: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { mobile: { contains: search, mode: 'insensitive' } },
              { iwellCode: { contains: search, mode: 'insensitive' } },
              { appCode: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
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
  },
);

// 10. DELETE /api/admin/existing-clients/clear
router.delete(
  '/existing-clients/clear',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const result = await prisma.existingClient.deleteMany({});
      res.json({
        success: true,
        message: `Successfully cleared all ${result.count} existing client records.`,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  },
);

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
      res.json({
        success: true,
        message: `Successfully deleted existing client ${deletedClient.name || id}.`,
        data: deletedClient,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 11. POST /api/admin/portfolio-valuations/upload
router.post(
  '/portfolio-valuations/upload',
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const file = req.file;
      if (!file) {
        res
          .status(400)
          .json({ success: false, error: 'CSV/Excel file is required' });
        return;
      }

      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(file.buffer, { type: 'buffer' });
      } catch {
        res.status(400).json({
          success: false,
          error:
            'Invalid file format. Please upload a valid CSV or Excel file.',
        });
        return;
      }

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        res.status(400).json({ success: false, error: 'File sheet is empty' });
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      const headerRowIndex = findHeaderRowIndex(worksheet!, [
        'Client Name',
        'Name',
      ]);
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(
        worksheet!,
        {
          range: headerRowIndex,
          defval: '',
        },
      );

      if (rawRows.length === 0) {
        res
          .status(400)
          .json({ success: false, error: 'File contains no data rows' });
        return;
      }

      // Validate required headers
      const firstRow = rawRows[0] || {};
      const requiredFields = [
        { name: 'Client Name', aliases: ['Client Name', 'CLIENT NAME'] },
        { name: 'PAN Number', aliases: ['PAN Number', 'PAN', 'PAN NUMBER'] },
      ];

      const missingKeys = [];
      for (const f of requiredFields) {
        const val = getRowValue(firstRow, f.aliases);
        if (val === undefined || String(val).trim() === '') {
          missingKeys.push(f.name);
        }
      }

      if (missingKeys.length > 0) {
        res.status(400).json({
          success: false,
          error: `Missing required CSV headers: ${missingKeys.join(', ')}`,
        });
        return;
      }

      // Parse all rows using getRowValue and aliases
      const parsedValuations = rawRows.map((row) => ({
        clientName:
          String(
            getRowValue(row, ['Client Name', 'CLIENT NAME']) || '',
          ).trim() || null,
        iwellCode:
          String(getRowValue(row, ['IWELL Code', 'IWELL CODE']) || '').trim() ||
          null,
        iwellCode2:
          String(
            getRowValue(row, ['IWELL Code 2', 'IWELLCODE2']) || '',
          ).trim() || null,
        pan:
          String(
            getRowValue(row, ['PAN Number', 'PAN', 'PAN NUMBER']) || '',
          ).trim() || null,
        balanceUnits: parseExcelNumber(
          getRowValue(row, ['Balance Units', 'BALANCE UNITS']),
        ),
        purchaseValue: parseExcelNumber(
          getRowValue(row, ['Purchase Value', 'PURCHASE VALUE']),
        ),
        currentValue: parseExcelNumber(
          getRowValue(row, ['Current Value', 'CURRENT VALUE']),
        ),
        oneDayChange: parseExcelNumber(
          getRowValue(row, ['One-Day Change', 'ONE DAY CHANGE']),
        ),
        dividend: parseExcelNumber(getRowValue(row, ['Dividend', 'DIVIDEND'])),
        averageHoldingDays: parseAvgHoldingDays(
          getRowValue(row, ['Average Holding Days', 'AVG HOLDING DAYS']),
        ),
        gain: parseExcelNumber(getRowValue(row, ['Gain', 'GAIN'])),
        absoluteReturn: parseExcelNumber(
          getRowValue(row, ['Absolute Return (%)', 'ABSOLUTE RETURN']),
        ),
        cagr: parseExcelNumber(getRowValue(row, ['CAGR (%)', 'CAGR'])),
        xirr: parseExcelNumber(getRowValue(row, ['XIRR (%)', 'XIRR', 'xirr'])),
      }));

      // Save using a transaction with chunking to prevent PostgreSQL parameter limits
      const count = await prisma.$transaction(
        async (tx) => {
          // 1. Reset valuation fields for all existing clients first
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

          // 2. Fetch all existing clients for matching
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
                const key = pan
                  ? `pan:${pan}`
                  : `name:${name.trim().toLowerCase()}`;
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

          // 1. Batch updates in chunks using Promise.all to run parallel queries
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

          // 2. Batch inserts of new clients
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
          timeout: 120000, // 120 seconds timeout for larger transactions
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
  },
);

// 12. GET /api/admin/portfolio-valuations
router.get(
  '/portfolio-valuations',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const search = ((req.query.search as string) || '').trim();

      const skip = (page - 1) * limit;

      const where: Prisma.ExistingClientWhereInput = {
        OR: [
          { balanceUnits: { not: null } },
          { purchaseValue: { not: null } },
          { currentValue: { not: null } },
        ],
        ...(search
          ? {
              AND: [
                {
                  OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { pan: { contains: search, mode: 'insensitive' } },
                    { iwellCode: { contains: search, mode: 'insensitive' } },
                    { iwellCode2: { contains: search, mode: 'insensitive' } },
                  ],
                },
              ],
            }
          : {}),
      };

      const [clients, total] = await Promise.all([
        prisma.existingClient.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.existingClient.count({ where }),
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
  },
);

// 13. DELETE /api/admin/portfolio-valuations/clear
router.delete(
  '/portfolio-valuations/clear',
  async (req: AuthenticatedRequest, res: Response, next) => {
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
  },
);

// 14. GET /api/admin/contact-messages
router.get(
  '/contact-messages',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 15. GET /api/admin/availability
router.get(
  '/availability',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const AVAILABILITY_FILE = path.join(
        __dirname,
        '../../uploads/availability.json',
      );
      let slots: string[] = [];
      if (fs.existsSync(AVAILABILITY_FILE)) {
        const fileContent = fs.readFileSync(AVAILABILITY_FILE, 'utf-8');
        slots = JSON.parse(fileContent) || [];
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

// 16. POST /api/admin/availability
router.post(
  '/availability',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { slots } = z
        .object({ slots: z.array(z.string()) })
        .parse(req.body);
      const UPLOAD_DIR = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
      const AVAILABILITY_FILE = path.join(UPLOAD_DIR, 'availability.json');
      fs.writeFileSync(
        AVAILABILITY_FILE,
        JSON.stringify(slots, null, 2),
        'utf-8',
      );
      res.json({
        success: true,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 17. GET /api/admin/aum-distribution
router.get(
  '/aum-distribution',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const groups = await prisma.folio.groupBy({
        by: ['schemeName'],
        _sum: {
          aum: true,
        },
      });

      const schemes = groups
        .map((g) => {
          const schemeName = (g.schemeName || '').trim();
          const amount = g._sum.aum || 0;
          return {
            schemeName,
            amount,
          };
        })
        .filter((s) => s.schemeName !== '' && s.amount > 0);

      // Sort descending by amount
      schemes.sort((a, b) => b.amount - a.amount);

      const totalAUM = schemes.reduce((sum, s) => sum + s.amount, 0);

      const schemesWithPercentage = schemes.map((s) => ({
        ...s,
        percentage: totalAUM > 0 ? (s.amount / totalAUM) * 100 : 0,
      }));

      res.json({
        success: true,
        data: {
          totalAUM,
          schemes: schemesWithPercentage,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// 18. GET /api/admin/queries
router.get(
  '/queries',
  async (req: AuthenticatedRequest, res: Response, next) => {
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
  },
);

// 19. PATCH /api/admin/queries/:id
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
  },
);

// 20. DELETE /api/admin/queries/:id
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
        message: `Successfully deleted query.`,
        data: deletedQuery,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 21. GET /api/admin/benchmark
router.get(
  '/benchmark',
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const querySchema = z.object({
        portfolioId: z.string().uuid().optional(),
        clientId: z.string().uuid().optional(),
        timeframe: z.enum(['1Y', '3Y', '5Y', 'ALL']).default('1Y'),
      });

      const parsed = querySchema.parse(req.query);

      if (!parsed.portfolioId && !parsed.clientId) {
        res.status(400).json({
          success: false,
          error: 'Either portfolioId or clientId must be provided',
        });
        return;
      }

      if (parsed.portfolioId && parsed.clientId) {
        res.status(400).json({
          success: false,
          error: 'Provide only one of portfolioId or clientId',
        });
        return;
      }

      const report = await generateAdminBenchmarkReport({
        portfolioId: parsed.portfolioId,
        clientId: parsed.clientId,
        timeframe: parsed.timeframe as Timeframe,
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

export default router;
