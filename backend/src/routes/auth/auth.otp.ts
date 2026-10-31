import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { generateOTP, sendOTP, saveOTP, verifyOTP, deleteOTP } from '../../services/otp';
import { prisma } from '../../lib/prisma';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { OAuth2Client } from 'google-auth-library';
import { ApiError } from '../../lib/api-error';
import { signToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '../../config/security';
import { generateUniqueReferralCode } from '../../utils';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OTP requests. Please wait 15 minutes and try again.' },
});

const passwordLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please wait 15 minutes and try again.' },
});

const REFRESH_ENABLED = process.env.ENABLE_REFRESH_TOKENS === 'true';

async function createTokenPair(
  user: { id: string; email: string | null; role: any },
  res: Response,
) {
  if (REFRESH_ENABLED) {
    const accessToken = signAccessToken({ userId: user.id, email: user.email ?? '', role: user.role });
    const refreshToken = signRefreshToken(user.id);
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({ data: { token: tokenHash, userId: user.id, expiresAt } });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return { token: accessToken, refreshToken };
  }
  return { token: signToken({ userId: user.id, email: user.email ?? '', role: user.role }) };
}

// 1. POST /api/auth/otp/send
const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  isRegistration: z.boolean().optional(),
});

router.post('/otp/send', otpSendLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email, isRegistration } = sendOtpSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    if (isRegistration) {
      const existingUser = await prisma.user.findFirst({ where: { email: formattedEmail } });
      if (existingUser) return next(ApiError.badRequest('Unable to complete registration. Please try logging in or contact support.'));
    }

    const otp = generateOTP();
    await saveOTP(formattedEmail, otp, 'login');
    
    // Send OTP email asynchronously - don't block the response
    // Log failure but don't block user registration/login
    sendOTP(formattedEmail, otp).catch((err) => {
      // Log the error but don't delete OTP - user can request resend
      console.error('Failed to send OTP email:', err);
    });

    res.json({ success: true, data: { message: 'OTP sent' } });
  } catch (error) { next(error); }
});

// 2. POST /api/auth/otp/verify
const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  referredBy: z.string().optional(),
});

router.post('/otp/verify', authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email, otp, name, password, referredBy } = verifyOtpSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const isValid = await verifyOTP(formattedEmail, otp, 'login');
    if (!isValid) return next(ApiError.badRequest('Invalid or expired OTP'));

    const hashedPassword = password ? await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS) : undefined;

    let referrerId: string | null = null;
    if (referredBy) {
      const referrerUser = await prisma.user.findUnique({ where: { referralCode: referredBy.trim().toUpperCase() } });
      if (referrerUser) referrerId = referrerUser.id;
    }

    const refCode = await generateUniqueReferralCode();

    let user = await prisma.user.findFirst({ where: { email: formattedEmail } });
    if (user) {
      user = await prisma.user.update({ where: { id: user.id }, data: { name: name || undefined, password: hashedPassword || undefined } });
    } else {
      user = await prisma.user.create({ data: { email: formattedEmail, name: name || null, password: hashedPassword || null, role: 'GUEST', referralCode: refCode, referrerId: referrerId || null } });
    }

    if (user.role !== 'ADMIN' && user.role !== 'CLIENT') {
      const clientRecords = await prisma.existingClient.findMany({ where: { email: { equals: formattedEmail, mode: 'insensitive' } } });
      if (clientRecords.length === 1) {
        const clientRecord = clientRecords[0]!;
        user = await prisma.user.update({ where: { id: user.id }, data: { role: 'CLIENT', name: user.name || clientRecord.name || null } });
        await prisma.client.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, activePlan: 'PREMIUM', advisorNotes: 'Logged in via OTP', activatedAt: new Date() } });
      }
    }

    const tokens = await createTokenPair(user, res);
    res.json({ success: true, data: { token: tokens.token, user: { id: user.id, email: user.email, name: user.name, role: user.role } } });
  } catch (error) { next(error); }
});

export default router;