// Mock Prisma before any other imports
const mockPrisma = {
  user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  lead: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  existingClient: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  folio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  assessment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  portfolio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  portfolioRow: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  score: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  advisorySession: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  refreshToken: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
  client: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), upsert: jest.fn() },
  supportQuery: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  contactMessage: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  $queryRaw: jest.fn(),
  $transaction: jest.fn(),
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  phone: '9876543210',
  role: 'GUEST',
  pan: null,
  dob: null,
  anniversary: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  referralCode: 'ABC123',
  referrerId: null,
  client: null,
};

const mockAssessment = {
  id: 'assessment-123',
  userId: 'user-123',
  age: 30,
  goal: 'WEALTH_CREATION',
  ageRange: '25_35',
  lifeStage: 'EARLY_CAREER',
  investmentTenure: '10_TO_20_YEARS',
  isCompletePortfolio: true,
  investmentStyle: 'REGULAR_MONTHLY_SIP',
  expectedReturn: '12_TO_15',
  riskBehavior: 'WAIT_PATIENTLY',
  monthlyInvestment: '6000_10000',
  emergencyFund: 'YES_MORE_THAN_6_MONTHS',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockPortfolio = {
  id: 'portfolio-123',
  userId: 'user-123',
  assessmentId: 'assessment-123',
  uploadType: 'EXCEL',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  rows: [],
  score: null,
};

const mockLead = {
  id: 'lead-123',
  userId: 'user-123',
  name: 'Test Lead',
  phone: '9876543210',
  scoreId: null,
  slot: new Date().toISOString(),
  status: 'NEW',
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAdvisorySession = {
  id: 'session-123',
  userId: 'user-123',
  preferredSlot1: new Date().toISOString(),
  preferredSlot2: new Date().toISOString(),
  preferredSlot3: new Date().toISOString(),
  confirmedSlot: null,
  googleMeetLink: null,
  status: 'PENDING',
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  user: mockUser,
};

const mockExistingClient = {
  id: 'client-123',
  name: 'Test Client',
  pan: 'ABCDE1234F',
  email: 'client@example.com',
  mobile: '9876543210',
  city: 'Mumbai',
  aum: 1000000,
  purchaseValue: 800000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  folios: [],
};

const mockScore = {
  id: 'score-123',
  portfolioId: 'portfolio-123',
  total: 85,
  goalAlignment: 18,
  assetAlloc: 17,
  diversification: 16,
  discipline: 17,
  efficiency: 17,
  tag: 'ALIGNED',
  insights: { textInsights: ['Good portfolio'], comparison: null },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  portfolio: mockPortfolio,
};

const mockContactMessage = {
  id: 'contact-123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '9876543210',
  subject: 'Test Subject',
  message: 'Test Message',
  createdAt: new Date().toISOString(),
};

const mockSupportQuery = {
  id: 'support-123',
  userId: 'user-123',
  subject: 'Test Subject',
  message: 'Test Message',
  priority: 'MEDIUM',
  status: 'PENDING',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    lead: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    existingClient: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    folio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    assessment: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    portfolio: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    portfolioRow: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    score: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    advisorySession: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    refreshToken: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
    client: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), upsert: jest.fn() },
    supportQuery: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    contactMessage: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  },
}

import request from 'supertest';
import express from 'express';
import OpenApiValidator from 'express-openapi-validator';
import { requestIdMiddleware } from '../../src/middleware/requestId';
import { errorHandler } from '../../src/middleware/error';
import { ApiError } from '../../src/lib/api-error';
import cookieParser from 'cookie-parser';
import authRouter from '../../src/routes/auth';
import assessRouter from '../../src/routes/assess';
import portfolioRouter from '../../src/routes/portfolio';
import scoreRouter from '../../src/routes/score';
import leadsRouter from '../../src/routes/leads';
import adminRouter from '../../src/routes/admin';
import chatRouter from '../../src/routes/chat';
import contactRouter from '../../src/routes/contact';
import supportRouter from '../../src/routes/support';
import metricsRouter from '../../src/routes/metrics';
import { getApiPrefix } from '../../src/config/apiVersion';
import { metricsMiddleware } from '../../src/routes/metrics';

describe('OpenAPI Contract Tests', () => {
  let app: ReturnType<typeof express>;
  const apiPrefix = getApiPrefix();

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: '50kb' }));
    app.use(cookieParser());
    app.use(requestIdMiddleware);

    // Add metrics middleware
    app.use((req, res, next) => {
      // Simple metrics middleware for testing
      next();
    }

    // Initialize all routes with OpenAPI validator
    const apiPrefix = getApiPrefix();
    app.use(`${apiPrefix}/auth`, authRouter);
    app.use(`${apiPrefix}/assess`, assessRouter);
    app.use(`${apiPrefix}/portfolio`, portfolioRouter);
    app.use(`${apiPrefix}/score`, scoreRouter);
    app.use(`${apiPrefix}/leads`, leadsRouter);
    app.use(`${apiPrefix}/admin`, adminRouter);
    app.use(`${apiPrefix}/chat`, chatRouter);
    app.use(`${apiPrefix}/contact`, contactRouter);
    app.use(`${apiPrefix}/support`, supportRouter);
    app.use(`${apiPrefix}/metrics`, metricsRouter);

    // OpenAPI Validator middleware
    app.use(
      OpenApiValidator.middleware({
        apiSpec: './src/lib/openapi.json',
        validateRequests: true,
        validateResponses: true,
        validateSecurity: {
          handlers: {
            bearerAuth: (req, auth, scopes) => {
              // Mock bearer auth for testing
              return Promise.resolve(true);
            },
            csrfToken: (req, auth, scopes) => {
              return Promise.resolve(true);
            },
            cookieAuth: (req, auth, scopes) => {
              return Promise.resolve(true);
            },
          },
        },
      })
    );

    app.use((req, res, next) => {
      next(ApiError.notFound('Route not found'));
    }
    app.use((err, req, res, next) => {
      // Sentry would capture the error automatically
      next(err);
    }
    app.use(require('../../src/middleware/error').errorHandler);
  }

  describe('Auth Endpoints Contract', () => {
    it('POST /api/v1/auth/register should validate request body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'short',
        })
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }

    it('POST /api/v1/auth/login should validate request body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid',
        })
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Assessment Endpoints Contract', () => {
    it('POST /api/v1/assess should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/assess')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Portfolio Endpoints Contract', () => {
    it('POST /api/v1/portfolio should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/portfolio')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Leads Endpoints Contract', () => {
    it('POST /api/v1/leads should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          name: 'Test',
          // Missing phone
        })
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Contact Endpoint Contract', () => {
    it('POST /api/v1/contact should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Support Endpoints Contract', () => {
    it('POST /api/v1/support should validate required fields', async () => {
      const res = await request(app)
        .post('/api/v1/support')
        .send({})
        .expect(400);

      expect(res.body.title).toBe('Validation Error');
    }
  }

  describe('Health Endpoints Contract', () => {
    it('GET /api/health should return healthy status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    }
  }

  describe('Error Response Format Contract', () => {
    it('should return RFC 7807 Problem Details format for 404', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(res.body.type).toBeDefined();
      expect(res.body.title).toBeDefined();
      expect(res.body.status).toBe(404);
      expect(res.body.detail).toBeDefined();
      expect(res.body.instance).toBeDefined();
    }

    it('should return RFC 7807 Problem Details format for validation errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid',
          password: '123',
        })
        .expect(400);

      expect(res.body.type).toBeDefined();
      expect(res.body.title).toBe('Validation Error');
      expect(res.body.status).toBe(400);
      expect(res.body.detail).toBeDefined();
      expect(res.body.instance).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
    }
  }

  describe('Success Response Format Contract', () => {
    beforeEach(() => {
      // Setup successful mock responses
      const { prisma } = require('../../src/lib/prisma');
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.assessment.findMany.mockResolvedValue([mockAssessment]);
      prisma.assessment.create.mockResolvedValue(mockAssessment);
      prisma.portfolio.findMany.mockResolvedValue([mockPortfolio]);
      prisma.portfolio.create.mockResolvedValue(mockPortfolio);
      prisma.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      prisma.lead.findMany.mockResolvedValue({ leads: [mockLead], total: 1, page: 1, limit: 10, pages: 1 });
      prisma.lead.create.mockResolvedValue(mockLead);
      prisma.advisorySession.findMany.mockResolvedValue([mockAdvisorySession]);
      prisma.advisorySession.create.mockResolvedValue(mockAdvisorySession);
      prisma.existingClient.findMany.mockResolvedValue([mockExistingClient]);
      prisma.existingClient.findUnique.mockResolvedValue(mockExistingClient);
      prisma.score.findUnique.mockResolvedValue(mockScore);
      prisma.contactMessage.create.mockResolvedValue(mockContactMessage);
      prisma.supportQuery.create.mockResolvedValue(mockSupportQuery);
      prisma.supportQuery.findMany.mockResolvedValue([mockSupportQuery]);
      prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    });

    it('GET /api/health should return success response format', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ status: 'healthy' });
      expect(res.body.requestId).toBeDefined();
    });

    it('GET /api/health/details should return detailed health response', async () => {
      const res = await request(app)
        .get('/api/health/details')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
      expect(res.body.data.checks).toBeDefined();
      expect(res.body.data.timestamp).toBeDefined();
      expect(res.body.requestId).toBeDefined();
    });

    it('POST /api/v1/auth/register should return success response format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'ValidPass123',
          name: 'New User',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.id).toBeDefined();
      expect(res.body.data.user.email).toBe('newuser@example.com');
    });

    it('POST /api/v1/assess should return success response format', async () => {
      const res = await request(app)
        .post('/api/v1/assess')
        .send({
          age: 30,
          goal: 'WEALTH_CREATION',
          ageRange: '25_35',
          lifeStage: 'EARLY_CAREER',
          investmentTenure: '10_TO_20_YEARS',
          isCompletePortfolio: true,
          investmentStyle: 'REGULAR_MONTHLY_SIP',
          expectedReturn: '12_TO_15',
          riskBehavior: 'WAIT_PATIENTLY',
          monthlyInvestment: '6000_10000',
          emergencyFund: 'YES_MORE_THAN_6_MONTHS',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.assessmentId).toBeDefined();
    });

    it('GET /api/v1/leads should return paginated response format', async () => {
      const res = await request(app)
        .get('/api/v1/leads')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.page).toBeDefined();
    });

    it('POST /api/v1/leads should return success response with leadId', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .send({
          name: 'Test Lead',
          phone: '9876543210',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.leadId).toBeDefined();
    });

    it('POST /api/v1/contact should return success response format', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '9876543210',
          subject: 'Test Subject',
          message: 'Test Message',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('POST /api/v1/support should return success response format', async () => {
      const res = await request(app)
        .post('/api/v1/support')
        .send({
          subject: 'Test Subject',
          message: 'Test Message',
          priority: 'MEDIUM',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('GET /api/v1/portfolio/:id should return portfolio with rows and score', async () => {
      const { prisma } = require('../../src/lib/prisma');
      prisma.portfolio.findUnique.mockResolvedValue({
        ...mockPortfolio,
        rows: [
          { id: 'row-1', fundName: 'HDFC Top 100 Fund', type: 'SIP', startDate: new Date(), sipAmount: 5000, invested: 60000, currentValue: 75000 },
        ],
        score: mockScore,
      });

      const res = await request(app)
        .get('/api/v1/portfolio/portfolio-123')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe('portfolio-123');
      expect(res.body.data.rows).toBeInstanceOf(Array);
      expect(res.body.data.score).toBeDefined();
    });

    it('GET /api/v1/score/:id should return score with all dimensions', async () => {
      const res = await request(app)
        .get('/api/v1/score/score-123')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.total).toBe(85);
      expect(res.body.data.goalAlignment).toBe(18);
      expect(res.body.data.assetAlloc).toBe(17);
      expect(res.body.data.diversification).toBe(16);
      expect(res.body.data.discipline).toBe(17);
      expect(res.body.data.efficiency).toBe(17);
      expect(res.body.data.tag).toBe('ALIGNED');
      expect(res.body.data.insights).toBeDefined();
      expect(res.body.data.insights.textInsights).toBeInstanceOf(Array);
    });

    it('should include requestId in all success responses', async () => {
      const endpoints = [
        { method: 'get', path: '/api/health' },
        { method: 'get', path: '/api/health/details' },
        { method: 'post', path: '/api/v1/assess', body: { age: 30, goal: 'WEALTH_CREATION' } },
      ];

      for (const endpoint of endpoints) {
        const res = await request(app)[endpoint.method](endpoint.path)
          .send(endpoint.body || {})
          .expect(200);
        expect(res.body.requestId).toBeDefined();
        expect(typeof res.body.requestId).toBe('string');
      }
    });

    it('should include RFC 7807 error fields in validation errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'invalid', password: '123' })
        .expect(400);

      expect(res.body.type).toBeDefined();
      expect(res.body.title).toBe('Validation Error');
      expect(res.body.status).toBe(400);
      expect(res.body.detail).toBeDefined();
      expect(res.body.instance).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  }
}
