import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
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
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';

// Verify required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GMAIL_APP_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GROK_API_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    process.exit(1);
  }
}

// Warn if GMAIL_USER is missing, since nodemailer relies on it
if (!process.env.GMAIL_USER) {
  console.warn(
    'Warning: GMAIL_USER environment variable is not set. OTP emails might fail.',
  );
}

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// ─── Security Middlewares ───────────────────────────────────────────────────
app.use(helmet());

// F13: CORS — require FRONTEND_URL in production, fallback only in dev
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin in development (Postman, curl).
      // In production, require an explicit origin.
      if (!origin) {
        if (process.env.NODE_ENV === 'production') {
          return callback(null, false);
        }
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      const isAllowed = allowedOrigins.some(
        (allowed) => allowed.replace(/\/$/, '') === normalizedOrigin,
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(
          `CORS blocked request from origin: ${origin}. Allowed origins:`,
          allowedOrigins,
        );
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

// F8: Explicit JSON body size limit to prevent payload abuse
app.use(express.json({ limit: '50kb' }));

// F5: Global rate limiter — 200 requests per 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
app.use(globalLimiter);

// Trigger reload to pick up new Prisma Client schema fields
// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'healthy' },
  });
});

// F7: Serve uploaded files behind authentication instead of publicly
app.use(
  '/uploads',
  authMiddleware,
  express.static(path.join(__dirname, '../uploads')),
);

app.use('/api/auth', authRouter);

app.use('/api/assess', assessRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/score', scoreRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/chat', chatRouter);
app.use('/api/contact', contactRouter);
app.use('/api/support', supportRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
