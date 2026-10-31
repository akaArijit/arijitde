import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';
import swaggerUi from 'swagger-ui-express';

dotenv.config();
if (!process.env.JWT_SECRET) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}
import { initSentry } from './lib/sentry';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth';
import assessRouter from './routes/assess';
import portfolioRouter from './routes/portfolio';
import scoreRouter from './routes/score';
import leadsRouter from './routes/leads';
import adminRouter from './routes/admin';
import chatRouter from './routes/chat';
import contactRouter from './routes/contact';
import supportRouter from './routes/support';
import metricsRouter, { metricsMiddleware } from './routes/metrics';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler } from './middleware/error';
import { authMiddleware, optionalAuthMiddleware, AuthenticatedRequest } from './middleware/auth';
import { csrfMiddleware } from './middleware/csrf';
import cookieParser from 'cookie-parser';
import { getApiPrefix } from './config/apiVersion';
import { openApiDocument } from './lib/openapi';
import { ApiError } from './lib/api-error';
import { prisma } from './lib/prisma';
import { redis, isRedisAvailable } from './lib/redis';
import { logger } from './lib/logger';

// Defaults and fallbacks before verification
if (process.env.ENABLE_REFRESH_TOKENS === undefined) {
  process.env.ENABLE_REFRESH_TOKENS = 'true';
}

// Verify required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GMAIL_APP_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GROK_API_KEY',
  'PAN_VERIFICATION_SECRET',
  'ENABLE_REFRESH_TOKENS',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.fatal({ envVar }, `Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Warn if GMAIL_USER is missing, since nodemailer relies on it
if (!process.env.GMAIL_USER) {
  logger.warn('GMAIL_USER environment variable is not set. OTP emails might fail.');
}

// AMFI scheme code validation with 24hr cache
let amfiValidationCache: { timestamp: number; valid: boolean } | null = null;
const AMFI_VALIDATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function validateAMFISchemeCodes(): Promise<void> {
  // Check cache first
  if (amfiValidationCache && Date.now() - amfiValidationCache.timestamp < AMFI_VALIDATION_TTL_MS) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CATEGORY_BENCHMARKS, CATEGORY_TOP_PERFORMERS } = require('./services/amfiService');
    const codesToCheck = new Set<number>([
      ...Object.values(CATEGORY_BENCHMARKS as Record<string, number>),
      ...Object.values(CATEGORY_TOP_PERFORMERS as Record<string, { code: number }>).map((performer) => performer.code),
    ]);

    let allValid = true;
    for (const code of codesToCheck) {
      try {
        const res = await fetch(`https://api.mfapi.in/mf/${code}`, { method: 'HEAD' });
        if (!res.ok) {
          logger.warn({ schemeCode: code, status: res.status }, 'AMFI scheme code may be invalid');
          allValid = false;
        }
      } catch {
        logger.warn({ schemeCode: code }, 'Failed to validate AMFI scheme code');
        allValid = false;
      }
    }
    logger.info('AMFI scheme code validation completed');
    amfiValidationCache = { timestamp: Date.now(), valid: allValid };
  } catch (err) {
    logger.warn({ err }, 'AMFI scheme code validation skipped');
  }
}

// Run validation once on startup (non-blocking)
validateAMFISchemeCodes().catch((err) => logger.error({ err }, 'AMFI validation failed'));

// Schedule periodic validation every 6 hours
setInterval(() => {
  validateAMFISchemeCodes().catch((err) => logger.error({ err }, 'AMFI validation failed'));
}, 6 * 60 * 60 * 1000).unref();

// Initialize Sentry (must be before other middleware)
initSentry();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ─── Security Middlewares ───────────────────────────────────────────────────
app.use(helmet());

// Request ID middleware (must come early for tracing)
app.use(requestIdMiddleware);

// F13: CORS — allow configured FRONTEND_URL, Vercel deployments (*.vercel.app), and local dev
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-side Next.js rewrites, mobile apps, Postman)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      let isVercel = false;
      try {
        const hostname = new URL(origin).hostname;
        isVercel = hostname === 'vercel.app' || hostname.endsWith('.vercel.app');
      } catch {}

      const isAllowed =
        isVercel ||
        allowedOrigins.some(
          (allowed) => allowed.replace(/\/$/, '') === normalizedOrigin,
        );

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(
          { origin, allowedOrigins },
          'CORS blocked request from origin',
        );
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

// F8: Explicit JSON body size limit to prevent payload abuse
app.use(express.json({ limit: '50kb' }));

// Cookie parser (must come before CSRF)
app.use(cookieParser());

// Metrics middleware (track HTTP metrics)
app.use(metricsMiddleware);

// Request timeout middleware (30s default)
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({
        success: false,
        error: 'Request timeout',
      });
    }
  }, 30000);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  next();
});

// CSRF protection (double-submit cookie, exempts Bearer tokens)
app.use(csrfMiddleware);

// Authentication middleware (sets req.user for authenticated requests)
app.use(optionalAuthMiddleware);

// F5: Global rate limiter — 200 requests per 15 min per IP + User-Agent fingerprint
// Authenticated users (req.user set) skip rate limiting

// Cache for rate limiter key hashes (avoids SHA256 per request)
const rateLimiterKeyCache = new Map<string, string>();

// FNV-1a 32-bit hash - faster than SHA256 for rate limiting
function fnv1a32(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const key = `${ip}:${ua}`;
    
    let hash = rateLimiterKeyCache.get(key);
    if (!hash) {
      hash = fnv1a32(key);
      rateLimiterKeyCache.set(key, hash);
      // Prevent unbounded growth
      if (rateLimiterKeyCache.size > 10000) {
        const firstKey = rateLimiterKeyCache.keys().next().value;
        if (firstKey !== undefined) {
          rateLimiterKeyCache.delete(firstKey);
        }
      }
    }
    return hash;
  },
  skip: (req: AuthenticatedRequest) => !!req.user,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
app.use(globalLimiter);

// Trigger reload to pick up new Prisma Client schema fields
// Root info route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Arijit De API Server is running',
    health: '/api/health',
    requestId: req.requestId,
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'healthy' },
    requestId: req.requestId,
  });
});

// Detailed health check with DB/Redis connectivity
app.get('/api/health/details', async (req, res) => {
  const requestId = req.requestId;
  const checks = {
    database: 'unknown',
    redis: 'unknown',
  };
  
  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch (e) {
    checks.database = 'unhealthy';
  }
  
  // Check Redis
  try {
    if (isRedisAvailable()) {
      await redis!.ping();
      checks.redis = 'healthy';
    } else {
      checks.redis = 'not configured';
    }
  } catch (e) {
    checks.redis = 'unhealthy';
  }
  
  const isHealthy = checks.database === 'healthy' && 
    (checks.redis === 'healthy' || checks.redis === 'not configured');
  
  const status = isHealthy ? 'healthy' : 'degraded';
  const statusCode = isHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    success: isHealthy,
    data: {
      status,
      checks,
      timestamp: new Date().toISOString(),
    },
    requestId,
  });
});

// CSRF bootstrap — safe GET that sets the csrf_token cookie
app.get('/api/csrf', (req, res) => {
  if (!req.cookies?.csrf_token) {
    res.cookie('csrf_token', crypto.randomBytes(32).toString('hex'), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
  res.json({ success: true });
});

// ─── OpenAPI / Swagger Documentation ──────────────────────────────────────────
app.get('/api/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'FinAnalysis API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  }),
);

// F7: Serve uploaded files behind authentication instead of publicly
app.use(
  '/uploads',
  authMiddleware,
  express.static(path.join(__dirname, '../uploads')),
);

// API routes (support both /api/v1 and legacy /api for frontend compatibility)
const apiPrefix = getApiPrefix();
const routers: [string, any][] = [
  ['/auth', authRouter],
  ['/assess', assessRouter],
  ['/portfolio', portfolioRouter],
  ['/score', scoreRouter],
  ['/leads', leadsRouter],
  ['/admin', adminRouter],
  ['/chat', chatRouter],
  ['/contact', contactRouter],
  ['/support', supportRouter],
  ['/metrics', metricsRouter],
];

for (const [route, router] of routers) {
  app.use(`${apiPrefix}${route}`, router);
  if (apiPrefix !== '/api') {
    app.use(`/api${route}`, router);
  }
}

// 404 handler for unknown routes
app.use((req, res, next) => {
  next(ApiError.notFound('Route not found'));
});

// Sentry error handler (must be after all routes, before global error handler)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Sentry will capture the error automatically via the Express integration
  // We just need to pass it to our error handler
  next(err);
});

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server started successfully`);
});

// ─── Render Keep-Alive ──────────────────────────────────────────────────────
// Prevents the Render free tier service from sleeping by pinging itself every 10 minutes
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_EXTERNAL_URL) {
  logger.info({ url: RENDER_EXTERNAL_URL }, 'Setting up Render Keep-Alive');
  setInterval(() => {
    fetch(`${RENDER_EXTERNAL_URL}/api/health`)
      .then((res) => logger.info({ status: res.status }, '[Keep-Alive] Ping successful'))
      .catch((err) => logger.error({ err }, '[Keep-Alive] Ping failed'));
  }, 10 * 60 * 1000);
}
