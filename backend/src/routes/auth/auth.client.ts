import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ApiError } from '../../lib/api-error';
import { generateOTP, sendOTP, saveOTP, verifyOTP, deleteOTP } from '../../services/otp';
import rateLimit from 'express-rate-limit';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { generateUniqueReferralCode, createTokenPair } from '../../utils/auth';

const PAN_VERIFICATION_SECRET = process.env.PAN_VERIFICATION_SECRET!;
if (!PAN_VERIFICATION_SECRET) {
  throw new Error('PAN_VERIFICATION_SECRET environment variable is required for PAN verification tokens.');
}

interface PanVerificationPayload {
  email: string;
  purpose: string;
  googleId?: string;
  referrerId?: string;
}

const router = Router();

const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OTP requests. Please wait 15 minutes and try again.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please wait 15 minutes and try again.' },
});

// POST /api/auth/client/otp/send
const clientOtpSendSchema = z.object({ email: z.string().email('Invalid email address') });

router.post('/client/otp/send', otpSendLimiter, async (req, res, next) => {
  try {
    const { email } = clientOtpSendSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const clientRecord = await prisma.existingClient.findFirst({
      where: { email: { equals: formattedEmail, mode: 'insensitive' } },
    });

    if (!clientRecord) return next(ApiError.badRequest('This email is not registered as a client. Please contact your advisor for assistance.'));

    const otp = generateOTP();
    await saveOTP(formattedEmail, otp, 'client_login');
    try { await sendOTP(formattedEmail, otp); }
    catch { await deleteOTP(formattedEmail, otp, 'client_login'); return next(ApiError.internal('Failed to send OTP email')); }

    res.json({ success: true, data: { message: 'Verification code sent to your email.' } });
  } catch (error) { next(error); }
});

// POST /api/auth/client/otp/verify
const clientOtpVerifySchema = z.object({ email: z.string().email('Invalid email address'), otp: z.string().length(6, 'OTP must be 6 digits') });

router.post('/client/otp/verify', authLimiter, async (req, res, next) => {
  try {
    const { email, otp } = clientOtpVerifySchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const isValid = await verifyOTP(formattedEmail, otp, 'client_login');
    if (!isValid) return next(ApiError.badRequest('Invalid or expired verification code.'));

    const clientRecords = await prisma.existingClient.findMany({ where: { email: { equals: formattedEmail, mode: 'insensitive' } } });
    if (clientRecords.length === 0) return next(ApiError.badRequest('This email is not registered as a client.'));

    const accounts = clientRecords.map((c) => {
      const pan = c.pan || '';
      const panMasked = pan.length >= 4 ? '*'.repeat(pan.length - 4) + pan.substring(pan.length - 4) : 'N/A';
      return { id: c.id, name: c.name || 'N/A', panMasked };
    });

    const tempToken = jwt.sign({ email: formattedEmail, purpose: 'client_pan_verification' }, PAN_VERIFICATION_SECRET, { expiresIn: '15m' });
    res.json({ success: true, data: { tempToken, accounts } });
  } catch (error) { next(error); }
});

// POST /api/auth/client/pan/verify
const clientPanVerifySchema = z.object({
  tempToken: z.string().min(1, 'Verification token is required'),
  accountId: z.string().uuid('Invalid account ID'),
  pan: z.string().min(1, 'PAN is required').transform((v) => v.trim().toUpperCase()),
});

router.post('/client/pan/verify', authLimiter, async (req, res, next) => {
  try {
    const { tempToken, accountId, pan } = clientPanVerifySchema.parse(req.body);

    let decoded: PanVerificationPayload;
    try { decoded = jwt.verify(tempToken, PAN_VERIFICATION_SECRET) as PanVerificationPayload; }
    catch { return next(ApiError.badRequest('Session expired or invalid. Please request a new verification code.')); }

    if (decoded.purpose !== 'client_pan_verification' || !decoded.email) return next(ApiError.badRequest('Invalid verification token.'));

    const emailNormalized = decoded.email.toLowerCase();
    const clientRecord = await prisma.existingClient.findUnique({ where: { id: accountId } });
    if (!clientRecord) return next(ApiError.notFound('Client account not found.'));

    if ((clientRecord.email || '').toLowerCase() !== emailNormalized) return next(ApiError.badRequest('This account does not belong to the verified email address.'));

    const recordPan = (clientRecord.pan || '').trim().toUpperCase();
    if (recordPan !== pan) return next(ApiError.badRequest('Incorrect PAN number. Please try again.'));

    const refCode = await generateUniqueReferralCode();
    const googleId = decoded.googleId || null;

    if (googleId) {
      const existingGoogleUser = await prisma.user.findUnique({ where: { googleId } });
      if (existingGoogleUser) await prisma.user.update({ where: { id: existingGoogleUser.id }, data: { googleId: null } });
    }

    let user = await prisma.user.findUnique({ where: { pan } });
    if (user) {
      const targetRole = user.role === 'ADMIN' ? 'ADMIN' : 'CLIENT';
      user = await prisma.user.update({ where: { id: user.id }, data: { role: targetRole, email: user.email || emailNormalized, name: user.name || clientRecord.name || undefined, googleId: googleId || user.googleId || undefined } });
    } else {
      user = await prisma.user.create({ data: { email: emailNormalized, pan, name: clientRecord.name || null, role: 'CLIENT', referralCode: refCode, referrerId: decoded.referrerId || null, googleId } });
    }

    await prisma.client.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, activePlan: 'PREMIUM', advisorNotes: 'Logged in via email OTP and PAN verification', activatedAt: new Date() } });

    const tokens = await createTokenPair(user, res);
    res.json({ success: true, data: { token: tokens.token, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, pan: user.pan } } });
  } catch (error) { next(error); }
});

export default router;