#!/usr/bin/env tsx
/**
 * OpenAPI Specification Generator Script
 * Generates OpenAPI 3.0 spec from route definitions
 */

import { writeFileSync } from 'fs';
import { OpenAPIGenerator, standardResponses, bearerAuthSecurity } from './src/lib/openapi-generator';
import { z } from 'zod';

// Import route schemas
import { CATEGORY_BENCHMARKS, CATEGORY_TOP_PERFORMERS } from './src/services/amfiService';

// Common schemas
const uuidSchema = z.string().uuid();
const emailSchema = z.string().email();
const phoneSchema = z.string().min(10);
const panSchema = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i);

// Common response schemas
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  role: z.enum(['GUEST', 'CLIENT', 'ADMIN']),
  pan: z.string().nullable(),
  dob: z.string().nullable(),
  anniversary: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const portfolioRowSchema = z.object({
  fundName: z.string(),
  type: z.enum(['SIP', 'LUMPSUM']),
  startDate: z.string().datetime(),
  sipAmount: z.number(),
  invested: z.number(),
  currentValue: z.number(),
});

const portfolioSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  assessmentId: z.string().uuid(),
  uploadType: z.enum(['EXCEL', 'MANUAL', 'FOLIO_IMPORT']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  rows: z.array(portfolioRowSchema).optional(),
  score: z.object({
    id: z.string().uuid(),
    portfolioId: z.string().uuid(),
    total: z.number(),
    goalAlignment: z.number(),
    assetAlloc: z.number(),
    diversification: z.number(),
    discipline: z.number(),
    efficiency: z.number(),
    tag: z.enum(['ALIGNED', 'MODERATE', 'NEEDS_REVIEW', 'NEEDS_STRUCTURING']),
    insights: z.unknown(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).optional(),
});

const assessmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  age: z.number(),
  goal: z.string(),
  ageRange: z.string().nullable(),
  lifeStage: z.string().nullable(),
  investmentTenure: z.string().nullable(),
  isCompletePortfolio: z.boolean().nullable(),
  investmentStyle: z.string().nullable(),
  expectedReturn: z.string().nullable(),
  riskBehavior: z.string().nullable(),
  monthlyInvestment: z.string().nullable(),
  emergencyFund: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const scoreSchema = z.object({
  id: z.string().uuid(),
  portfolioId: z.string().uuid(),
  total: z.number(),
  goalAlignment: z.number(),
  assetAlloc: z.number(),
  diversification: z.number(),
  discipline: z.number(),
  efficiency: z.number(),
  tag: z.enum(['ALIGNED', 'MODERATE', 'NEEDS_REVIEW', 'NEEDS_STRUCTURING']),
  insights: z.unknown(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const leadSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  phone: z.string(),
  scoreId: z.string().uuid().nullable(),
  slot: z.string().datetime().nullable(),
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED']),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const advisorySessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  preferredSlot1: z.string().datetime(),
  preferredSlot2: z.string().datetime(),
  preferredSlot3: z.string().datetime(),
  confirmedSlot: z.string().datetime().nullable(),
  googleMeetLink: z.string().url().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'REFUNDED']),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const paginatedResponse = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(z.unknown()),
    total: z.number(),
    page: z.number(),
    nextCursor: z.string().optional(),
    nextCursorId: z.string().optional(),
  }),
});

const errorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
  detail: z.string().optional(),
  instance: z.string().optional(),
});

const paginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.object({
      items: z.array(itemSchema),
      total: z.number(),
      page: z.number(),
      nextCursor: z.string().optional(),
      nextCursorId: z.string().optional(),
    }),
  });

// Initialize generator
const generator = new OpenAPIGenerator({
  title: 'FinAnalysis API',
  version: '1.0.0',
  description: 'FinAnalysis API - Financial analysis and advisory platform. All endpoints are prefixed with `/api/v1`. Uses RFC 7807 Problem Details for errors.',
  tags: [
    { name: 'Authentication', description: 'User authentication and authorization' },
    { name: 'Assessment', description: 'Risk assessment and profiling' },
    { name: 'Portfolio', description: 'Portfolio management and analysis' },
    { name: 'Scoring', description: 'Portfolio scoring engine' },
    { name: 'Leads', description: 'Lead management and advisory sessions' },
    { name: 'Admin', description: 'Admin panel operations' },
    { name: 'Chat', description: 'AI chat assistant' },
    { name: 'Contact', description: 'Contact form submissions' },
    { name: 'Support', description: 'Support queries' },
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Metrics', description: 'Prometheus metrics' },
  ],
  servers: [
    { url: 'https://api.finanalysis.site/api/v1', description: 'Production server' },
    { url: 'http://localhost:5000/api/v1', description: 'Development server' },
  ],
});

// Add schemas to components
const addSchemas = () => {
  generator.addSchema('User', userSchema);
  generator.addSchema('PortfolioRow', portfolioRowSchema);
  generator.addSchema('Portfolio', portfolioSchema);
  generator.addSchema('Assessment', assessmentSchema);
  generator.addSchema('Score', scoreSchema);
  generator.addSchema('Lead', leadSchema);
  generator.addSchema('AdvisorySession', advisorySessionSchema);
  generator.addSchema('PaginatedResponse', paginatedResponse);
  generator.addSchema('ErrorResponse', errorResponse);
};

// Standard error responses
const standardErrors = {
  400: StandardResponses.error(400, 'Bad Request'),
  401: StandardResponses.unauthorized(),
  403: StandardResponses.forbidden(),
  404: StandardResponses.notFound(),
  429: StandardResponses.tooManyRequests(),
  500: StandardResponses.internalError(),
};

function createOperation(
  summary: string,
  description: string,
  responses: Record<string, any>,
  security = bearerAuthSecurity,
  tags: string[] = []
) {
  return {
    summary,
    description,
    responses,
    security,
    tags,
    operationId: `${description.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
  };
}

// Define all routes
function defineRoutes() {
  // ===== AUTHENTICATION =====
  // POST /api/v1/auth/register
  generator.addPath('/auth/register', 'post', createOperation(
    'Register new user',
    'Register a new user account with email and password',
    {
      201: StandardResponses.success(z.object({
        user: userSchema,
        accessToken: z.string(),
      })),
      ...standardErrors,
    },
    [],
    ['Authentication']
  ));

  // POST /api/v1/auth/login
  generator.addPath('/auth/login', 'post', createOperation(
    'User login',
    'Login with email and password',
    {
      200: StandardResponses.success(z.object({
        user: userSchema,
        accessToken: z.string(),
      })),
      ...standardErrors,
    },
    [],
    ['Authentication']
  ));

  // POST /api/v1/auth/google
  generator.addPath('/auth/google', 'post', createOperation(
    'Google OAuth',
    'Authenticate with Google OAuth token',
    {
      200: StandardResponses.success(z.object({
        user: userSchema,
        accessToken: z.string(),
      })),
      ...standardErrors,
    },
    [],
    ['Authentication']
  ));

  // POST /api/v1/auth/refresh
  generator.addPath('/auth/refresh', 'post', createOperation(
    'Refresh access token',
    'Refresh JWT access token using refresh token',
    {
      200: StandardResponses.success(z.object({
        token: z.string(),
      })),
      ...standardErrors,
    },
    [],
    ['Authentication']
  ));

  // POST /api/v1/auth/logout
  generator.addPath('/auth/logout', 'post', createOperation(
    'Logout',
    'Logout and invalidate refresh token',
    {
      200: StandardResponses.success(z.object({
        message: z.string(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Authentication']
  ));

  // GET /api/v1/auth/me
  generator.addPath('/auth/me', 'get', createOperation(
    'Get current user',
    'Get authenticated user profile',
    {
      200: StandardResponses.success(userSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Authentication']
  ));

  // POST /api/v1/auth/otp/send
  generator.addPath('/auth/otp/send', 'post', createOperation(
    'Send OTP',
    'Send OTP to email for verification',
    {
      200: StandardResponses.success(z.object({
        message: z.string(),
      })),
      ...standardErrors,
    },
    [],
    ['Authentication']
  ));

  // POST /api/v1/auth/otp/verify
  generator.addPath('/auth/otp/verify', 'post', createOperation(
    'Verify OTP',
    'Verify OTP and complete registration/login',
    {
      200: StandardResponses.success(z.object({
        token: z.string(),
        user: userSchema,
      })),
      ...standardErrors,
    },
    [],
    ['Authentication']
  ));

  // POST /api/v1/auth/admin/login
  generator.addPath('/auth/admin/login', 'post', createOperation(
    'Admin login',
    'Admin login with email and password',
    {
      200: StandardResponses.success(z.object({
        token: z.string(),
        user: z.object({
          id: z.string().uuid(),
          email: z.string().email(),
          name: z.string().nullable(),
          role: z.literal('ADMIN'),
        }),
      })),
      ...standardErrors,
    },
    [],
    ['Authentication']
  ));

  // ===== ASSESSMENT =====
  // POST /api/v1/assess
  generator.addPath('/assess', 'post', createOperation(
    'Create assessment',
    'Create a new risk assessment',
    {
      201: StandardResponses.success(z.object({
        assessmentId: z.string().uuid(),
        age: z.number(),
        goal: z.string(),
        ageRange: z.string().nullable(),
        lifeStage: z.string().nullable(),
        investmentTenure: z.string().nullable(),
        isCompletePortfolio: z.boolean().nullable(),
        investmentStyle: z.string().nullable(),
        expectedReturn: z.string().nullable(),
        riskBehavior: z.string().nullable(),
        monthlyInvestment: z.string().nullable(),
        emergencyFund: z.string().nullable(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Assessment']
  ));

  // GET /api/v1/assess
  generator.addPath('/assess', 'get', createOperation(
    'List assessments',
    'List all assessments for the authenticated user',
    {
      200: StandardResponses.success(z.array(assessmentSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Assessment']
  ));

  // GET /api/v1/assess/{id}
  generator.addPath('/assess/{id}', 'get', createOperation(
    'Get assessment',
    'Get assessment by ID',
    {
      200: StandardResponses.success(assessmentSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Assessment']
  ).parameters([
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // GET /api/v1/assess/user/{userId}
  generator.addPath('/assess/user/{userId}', 'get', createOperation(
    'Get user assessment',
    'Get latest assessment for a user',
    {
      200: StandardResponses.success(assessmentSchema.nullable()),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Assessment']
  ).parameters([
    { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // ===== PORTFOLIO =====
  // POST /api/v1/portfolio
  generator.addPath('/portfolio', 'post', createOperation(
    'Create portfolio',
    'Create a new portfolio from uploaded file or manual entry',
    {
      201: StandardResponses.success(z.object({
        portfolioId: z.string().uuid(),
        rowCount: z.number(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Portfolio']
  ));

  // POST /api/v1/portfolio/upload
  generator.addPath('/portfolio/upload', 'post', createOperation(
    'Upload portfolio file',
    'Upload Excel/CSV portfolio file for analysis',
    {
      201: StandardResponses.success(z.object({
        portfolioId: z.string().uuid(),
        rowCount: z.number(),
      })),
      400: StandardResponses.error(400, 'Bad Request'),
      403: StandardResponses.forbidden(),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Portfolio']
  ).requestBody({
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
            assessmentId: { type: 'string', format: 'uuid' },
          },
          required: ['file', 'assessmentId'],
        },
      },
    });

  // POST /api/v1/portfolio/manual
  generator.addPath('/portfolio/manual', 'post', createOperation(
    'Create portfolio manually',
    'Create portfolio with manually entered data',
    {
      201: StandardResponses.success(z.object({
        portfolioId: z.string().uuid(),
        rowCount: z.number(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Portfolio']
  ).requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            assessmentId: { type: 'string', format: 'uuid' },
            rows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  fundName: { type: 'string' },
                  type: { type: 'string', enum: ['SIP', 'LUMPSUM'] },
                  startDate: { type: 'string', format: 'date-time' },
                  sipAmount: { type: 'number' },
                  invested: { type: 'number' },
                  currentValue: { type: 'number' },
                },
                required: ['fundName', 'type', 'startDate', 'sipAmount', 'invested', 'currentValue'],
              },
            },
          },
          required: ['assessmentId', 'rows'],
        },
      },
    });

  // GET /api/v1/portfolio
  generator.addPath('/portfolio', 'get', createOperation(
    'List portfolios',
    'List all portfolios for the authenticated user',
    {
      200: StandardResponses.success(z.array(portfolioSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Portfolio']
  ));

  // GET /api/v1/portfolio/{id}
  generator.addPath('/portfolio/{id}', 'get', createOperation(
    'Get portfolio',
    'Get portfolio by ID',
    {
      200: StandardResponses.success(portfolioSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Portfolio']
  ).parameters([
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // GET /api/v1/portfolio/client-data
  generator.addPath('/portfolio/client-data', 'get', createOperation(
    'Get client portfolio data',
    'Get existing client portfolio data from folio records',
    {
      200: StandardResponses.success(z.object({
        folios: z.array(z.unknown()),
        // ... additional fields
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Portfolio']
  ));

  // ===== SCORING =====
  // POST /api/v1/score/{portfolioId}
  generator.addPath('/score/{portfolioId}', 'post', createOperation(
    'Calculate portfolio score',
    'Calculate comprehensive portfolio score',
    {
      200: StandardResponses.success(scoreSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Scoring']
  ).parameters([
    { name: 'portfolioId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // GET /api/v1/score/{id}
  generator.addPath('/score/{id}', 'get', createOperation(
    'Get score',
    'Get score by ID',
    {
      200: StandardResponses.success(scoreSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Scoring']
  ).parameters([
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // GET /api/v1/score/portfolio/{portfolioId}
  generator.addPath('/score/portfolio/{portfolioId}', 'get', createOperation(
    'Get portfolio scores',
    'Get all scores for a portfolio',
    {
      200: StandardResponses.success(z.array(scoreSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Scoring']
  ).parameters([
    { name: 'portfolioId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // ===== LEADS & ADVISORY SESSIONS =====
  // POST /api/v1/leads
  generator.addPath('/leads', 'post', createOperation(
    'Create lead',
    'Create a new lead/booking',
    {
      201: StandardResponses.success(z.object({
        leadId: z.string().uuid(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ));

  // GET /api/v1/leads
  generator.addPath('/leads', 'get', createOperation(
    'List leads (admin)',
    'List all leads with pagination (admin only)',
    {
      200: StandardResponses.success(paginatedSchema(leadSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ).parameters([
    { name: 'status', in: 'query', schema: { type: 'string', enum: ['NEW', 'CONTACTED', 'CONVERTED'] } },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
  ]));

  // GET /api/v1/leads/my-bookings
  generator.addPath('/leads/my-bookings', 'get', createOperation(
    'Get user bookings',
    'Get authenticated user\'s lead bookings',
    {
      200: StandardResponses.success(z.array(leadSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ));

  // GET /api/v1/leads/availability
  generator.addPath('/leads/availability', 'get', createOperation(
    'Get available slots',
    'Get available booking slots',
    {
      200: StandardResponses.success(z.array(z.string())),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ));

  // GET /api/v1/leads/my-sessions
  generator.addPath('/leads/my-sessions', 'get', createOperation(
    'Get user sessions',
    'Get authenticated user\'s advisory sessions',
    {
      200: StandardResponses.success(z.array(advisorySessionSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ));

  // GET /api/v1/leads/admin/sessions
  generator.addPath('/leads/admin/sessions', 'get', createOperation(
    'Get admin sessions',
    'Get all advisory sessions (admin only)',
    {
      200: StandardResponses.success(z.array(advisorySessionSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ));

  // POST /api/v1/leads/book-session
  generator.addPath('/leads/book-session', 'post', createOperation(
    'Book session (auth)',
    'Book advisory session for authenticated user',
    {
      200: StandardResponses.success(advisorySessionSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ).requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            slot1: { type: 'string', format: 'date-time' },
            slot2: { type: 'string', format: 'date-time' },
            slot3: { type: 'string', format: 'date-time' },
          },
          required: ['slot1', 'slot2', 'slot3'],
        },
      },
    });

  // POST /api/v1/leads/book-session-public
  generator.addPath('/leads/book-session-public', 'post', createOperation(
    'Book session (public)',
    'Book advisory session without authentication',
    {
      200: StandardResponses.success(advisorySessionSchema),
      ...standardErrors,
    },
    []
  ).requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            slot1: { type: 'string', format: 'date-time' },
            slot2: { type: 'string', format: 'date-time' },
            slot3: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'phone', 'email', 'slot1', 'slot2', 'slot3'],
        },
      },
    });

  // GET /api/v1/leads/my-bookings
  generator.addPath('/leads/my-bookings', 'get', createOperation(
    'Get user bookings',
    'Get authenticated user\'s lead bookings',
    {
      200: StandardResponses.success(z.array(leadSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ));

  // GET /api/v1/leads/admin/sessions
  generator.addPath('/leads/admin/sessions', 'get', createOperation(
    'Get admin sessions',
    'Get all advisory sessions (admin only)',
    {
      200: StandardResponses.success(z.array(advisorySessionSchema)),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ));

  // POST /api/v1/leads/admin/sessions/{id}/confirm
  generator.addPath('/leads/admin/sessions/{id}/confirm', 'post', createOperation(
    'Confirm session',
    'Admin confirm advisory session with Google Meet link',
    {
      200: StandardResponses.success(advisorySessionSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ).parameters([
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]).requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            confirmedSlot: { type: 'string', format: 'date-time' },
            googleMeetLink: { type: 'string', format: 'uri' },
          },
          required: ['confirmedSlot', 'googleMeetLink'],
        },
      },
    });

  // POST /api/v1/leads/admin/sessions/{id}/notes
  generator.addPath('/leads/admin/sessions/{id}/notes', 'post', createOperation(
    'Update session notes',
    'Admin update session notes',
    {
      200: StandardResponses.success(advisorySessionSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ).parameters([
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]).requestBody({
    required: false,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            notes: { type: 'string' },
          },
        },
      },
    });

  // POST /api/v1/leads/admin/sessions/{id}/refund
  generator.addPath('/leads/admin/sessions/{id}/refund', 'post', createOperation(
    'Refund session',
    'Admin refund advisory session',
    {
      200: StandardResponses.success(z.object({
        message: z.string(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ).parameters([
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // DELETE /api/v1/leads/admin/sessions/{id}
  generator.addPath('/leads/admin/sessions/{id}', 'delete', createOperation(
    'Delete session',
    'Admin delete advisory session',
    {
      200: StandardResponses.success(advisorySessionSchema),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Leads']
  ).parameters([
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
  ]));

  // ===== ADMIN =====
  // GET /api/v1/admin/stats
  generator.addPath('/admin/stats', 'get', createOperation(
    'Get admin stats',
    'Get dashboard statistics for admin',
    {
      200: StandardResponses.success(z.object({
        totalUsers: z.number(),
        totalClients: z.number(),
        totalLeads: z.number(),
        attendedLeads: z.number(),
        totalFolios: z.number(),
        totalExistingClients: z.number(),
        totalPortfolioValuations: z.number(),
        totalAUM: z.number(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Admin']
  ));

  // GET /api/v1/admin/users
  generator.addPath('/admin/users', 'get', createOperation(
    'List users',
    'List all users with pagination (admin only)',
    {
      200: StandardResponses.success(z.object({
        users: z.array(z.object({
          id: z.string().uuid(),
          email: z.string().email(),
          name: z.string().nullable(),
          phone: z.string().nullable(),
          pan: z.string().nullable(),
          role: z.enum(['GUEST', 'CLIENT', 'ADMIN']),
          dob: z.string().nullable(),
          anniversary: z.string().nullable(),
          createdAt: z.string().datetime(),
          assessments: z.array(z.unknown()),
          portfolios: z.array(z.unknown()),
          leads: z.array(z.unknown()),
          client: z.unknown().nullable(),
        })),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          pages: z.number(),
        }),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Admin']
  ).parameters([
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
  ]));

  // POST /api/v1/admin/portfolio-upload
  generator.addPath('/admin/portfolio-upload', 'post', createOperation(
    'Upload portfolio (admin)',
    'Admin bulk upload portfolio Excel files',
    {
      200: StandardResponses.success(z.object({
        count: z.number(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Admin']
  ).requestBody({
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
          },
          required: ['file'],
        },
      },
    });

  // POST /api/v1/admin/sync-folios
  generator.addPath('/admin/sync-folios', 'post', createOperation(
    'Sync folios',
    'Sync folio data from external source',
    {
      200: StandardResponses.success(z.object({
        message: z.string(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Admin']
  ));

  // POST /api/v1/admin/existing-clients/upload
  generator.addPath('/admin/existing-clients/upload', 'post', createOperation(
    'Upload existing clients',
    'Upload existing clients CSV/Excel file',
    {
      200: StandardResponses.success(z.object({
        count: z.number(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Admin']
  ).requestBody({
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
          },
          required: ['file'],
        },
      },
    });

  // GET /api/v1/admin/existing-clients
  generator.addPath('/admin/existing-clients', 'get', createOperation(
    'List existing clients',
    'List existing clients with pagination',
    {
      200: StandardResponses.success(z.object({
        clients: z.array(z.unknown()),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          pages: z.number(),
        }),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Admin']
  ).parameters([
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
    { name: 'search', in: 'query', schema: { type: 'string' } },
  ]));

  // DELETE /api/v1/admin/existing-clients/clear
  generator.addPath('/admin/existing-clients/clear', 'delete', createOperation(
    'Clear existing clients',
    'Clear all existing client records',
    {
      200: StandardResponses.success(z.object({
        count: z.number(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Admin']
  ));

  // ===== CHAT =====
  // POST /api/v1/chat
  generator.addPath('/chat', 'post', createOperation(
    'AI chat',
    'Send message to AI financial advisor',
    {
      200: StandardResponses.success(z.object({
        text: z.string(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Chat']
  ).requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant'] },
                  content: { type: 'string', minLength: 1 },
                },
                required: ['role', 'content'],
              },
            },
          },
          required: ['messages'],
        },
      },
    });

  // ===== CONTACT =====
  // POST /api/v1/contact
  generator.addPath('/contact', 'post', createOperation(
    'Submit contact form',
    'Submit contact form',
    {
      200: StandardResponses.success(z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email(),
        phone: z.string().nullable(),
        subject: z.string().nullable(),
        message: z.string(),
        createdAt: z.string().datetime(),
      })),
      ...standardErrors,
    },
    [],
    ['Contact']
  ).requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            subject: { type: 'string' },
            message: { type: 'string' },
          },
          required: ['name', 'email', 'message'],
        },
      },
    });

  // ===== SUPPORT =====
  // POST /api/v1/support
  generator.addPath('/support', 'post', createOperation(
    'Submit support query',
    'Submit support query',
    {
      200: StandardResponses.success(z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        subject: z.string(),
        message: z.string(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        status: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      })),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Support']
  ).requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            message: { type: 'string' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
          },
          required: ['subject', 'message', 'priority'],
        },
      },
    });

  // GET /api/v1/support
  generator.addPath('/support', 'get', createOperation(
    'List support queries',
    'List user support queries',
    {
      200: StandardResponses.success(z.array(z.object({
        id: z.string().uuid(),
        userId: z.string().uuid(),
        subject: z.string(),
        message: z.string(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
        status: z.string(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      }))),
      ...standardErrors,
    },
    bearerAuthSecurity,
    ['Support']
  ));

  // ===== HEALTH =====
  // GET /api/health
  generator.addPath('/health', 'get', createOperation(
    'Health check',
    'Basic health check endpoint',
    {
      200: StandardResponses.success(z.object({
        status: z.literal('healthy'),
      })),
    },
    [],
    ['Health']
  ));

  // GET /api/health/details
  generator.addPath('/health/details', 'get', createOperation(
    'Detailed health check',
    'Detailed health check with database and Redis status',
    {
      200: StandardResponses.success(z.object({
        status: z.enum(['healthy', 'degraded']),
        checks: z.object({
          database: z.enum(['healthy', 'unhealthy']),
          redis: z.enum(['healthy', 'unhealthy', 'not configured']),
        }),
        timestamp: z.string().datetime(),
      })),
      503: StandardResponses.error(503, 'Service Unavailable'),
    },
    [],
    ['Health']
  ));

  // GET /api/csrf
  generator.addPath('/csrf', 'get', createOperation(
    'Get CSRF token',
    'Get CSRF token cookie',
    {
      200: StandardResponses.success(z.object({
        success: z.literal(true),
      })),
    },
    [],
    ['Authentication']
  ));

  // GET /api/openapi.json
  generator.addPath('/openapi.json', 'get', createOperation(
    'Get OpenAPI spec',
    'Get OpenAPI 3.0 specification',
    {
      200: {
        description: 'OpenAPI 3.0 specification',
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
    },
    [],
    ['Documentation']
  ));

  // GET /api/docs
  generator.addPath('/docs', 'get', createOperation(
    'Swagger UI',
    'Swagger UI documentation',
    {
      200: {
        description: 'Swagger UI HTML',
        content: {
          'text/html': {
            schema: { type: 'string' },
          },
        },
      },
    },
    [],
    ['Documentation']
  ));
}

// Generate the spec
addSchemas();
defineRoutes();

// Build and export
const spec = generator.build();

// Write to file
writeFileSync('./openapi.json', JSON.stringify(spec, null, 2));
console.log('OpenAPI specification generated successfully at ./openapi.json');
