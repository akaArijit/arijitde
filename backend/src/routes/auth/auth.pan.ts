import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { ApiError } from '../../lib/api-error';
import rateLimit from 'express-rate-limit';
import { signAccessToken, signRefreshToken, verifyRefreshToken, signToken } from '../../lib/jwt';
import { generateUniqueReferralCode, createTokenPair } from '../../utils/auth';
import { generateOTP, sendOTP, saveOTP, verifyOTP, deleteOTP } from '../../services/otp';
import { SECURITY_CONFIG } from '../../config/security';

const router = Router();

const passwordLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

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

// POST /api/auth/pan/login
const panLoginSchema = z.object({
  pan: z.string().min(1, 'PAN is required').transform((val) => val.trim().toUpperCase()).pipe(z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')),
  password: z.string().min(1, 'Password is required'),
});

router.post('/pan/login', passwordLoginLimiter, async (req, res, next) => {
  try {
    const { pan, password } = panLoginSchema.parse(req.body);
    const formattedPan = pan.trim().toUpperCase();

    const user = await prisma.user.findUnique({ where: { pan: formattedPan } });
    if (!user) return next(ApiError.unauthorized('Invalid PAN or password. Please check your credentials.'));

    if (user.role !== 'CLIENT') return next(ApiError.unauthorized('Invalid PAN or password. Please check your credentials.'));

    if (!user.password) return next(ApiError.unauthorized('Invalid PAN or password. Please check your credentials.'));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(ApiError.unauthorized('Invalid PAN or password. Please check your credentials.'));

    const tokens = await createTokenPair(user, res);
    res.json({ success: true, data: { token: tokens.token, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, pan: user.pan } } });
  } catch (error) { next(error); }
});

// POST /api/auth/activation/send-otp
const sendActivationOtpSchema = z.object({
  pan: z.string().min(1, 'PAN is required').transform((val) => val.trim().toUpperCase()).pipe(z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')),
  email: z.string().email('Invalid email address'),
});

router.post('/activation/send-otp', otpSendLimiter, async (req, res, next) => {
  try {
    const { pan, email } = sendActivationOtpSchema.parse(req.body);
    const formattedPan = pan.trim().toUpperCase();
    const formattedEmail = email.toLowerCase();

    const userWithPan = await prisma.user.findUnique({ where: { pan: formattedPan } });
    if (userWithPan) return next(ApiError.badRequest('An account has already been activated for this PAN. Please log in using your PAN.'));

    const existingClientMatch = await prisma.existingClient.findFirst({ where: { pan: { equals: formattedPan, mode: 'insensitive' }, email: { equals: formattedEmail, mode: 'insensitive' } } });
    let matches = !!existingClientMatch;

    if (!matches) {
      const folioMatch = await prisma.folio.findFirst({ where: { OR: [{ clientPan: { equals: formattedPan, mode: 'insensitive' } }, { panAsPerFolio: { equals: formattedPan, mode: 'insensitive' } }], email: { equals: formattedEmail, mode: 'insensitive' } } });
      matches = !!folioMatch;
    }

    if (!matches) return next(ApiError.notFound('No matching client profile found with the provided PAN and Email combination. Please verify your details or contact support.'));

    const otp = generateOTP();
    await saveOTP(formattedEmail, otp, 'activation');
    try { await sendOTP(formattedEmail, otp); }
    catch { await deleteOTP(formattedEmail, otp, 'activation'); return next(ApiError.internal('Failed to send OTP email')); }

    res.json({ success: true, data: { message: 'Activation OTP sent successfully' } });
  } catch (error) { next(error); }
});

// POST /api/auth/activation/verify-otp
const verifyActivationOtpSchema = z.object({
  pan: z.string().min(1, 'PAN is required').transform((val) => val.trim().toUpperCase()).pipe(z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format')),
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
});

router.post('/activation/verify-otp', authLimiter, async (req, res, next) => {
  try {
    const { pan, email, otp, password } = verifyActivationOtpSchema.parse(req.body);
    const formattedPan = pan.trim().toUpperCase();
    const formattedEmail = email.toLowerCase();

    const userWithPan = await prisma.user.findUnique({ where: { pan: formattedPan } });
    if (userWithPan) return next(ApiError.badRequest('An account has already been activated for this PAN. Please log in using your PAN.'));

    const isValid = await verifyOTP(formattedEmail, otp, 'activation');
    if (!isValid) return next(ApiError.badRequest('Invalid or expired activation OTP.'));

    let clientName: string | null = null;
    const existingClientMatch = await prisma.existingClient.findFirst({ where: { pan: { equals: formattedPan, mode: 'insensitive' }, email: { equals: formattedEmail, mode: 'insensitive' } } });
    if (existingClientMatch) clientName = existingClientMatch.name;
    else {
      const folioMatch = await prisma.folio.findFirst({ where: { OR: [{ clientPan: { equals: formattedPan, mode: 'insensitive' } }, { panAsPerFolio: { equals: formattedPan, mode: 'insensitive' } }], email: { equals: formattedEmail, mode: 'insensitive' } } });
      if (folioMatch) clientName = folioMatch.clientName || folioMatch.nameAsPerFolio;
    }

    const hashedPassword = await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
    const refCode = await generateUniqueReferralCode();

    const user = await prisma.$transaction(async (tx: any) => {
      const guestUser = await tx.user.findFirst({ where: { email: formattedEmail, pan: null } });
      let updatedUser;
      if (guestUser) {
        updatedUser = await tx.user.update({ where: { id: guestUser.id }, data: { pan: formattedPan, name: guestUser.name || clientName || undefined, password: hashedPassword, role: 'CLIENT' } });
      } else {
        updatedUser = await tx.user.create({ data: { email: formattedEmail, pan: formattedPan, name: clientName, password: hashedPassword, role: 'CLIENT', referralCode: refCode } });
      }
      await tx.client.upsert({ where: { userId: updatedUser.id }, update: {}, create: { userId: updatedUser.id, activePlan: 'PREMIUM', advisorNotes: 'Activated via PAN + Email OTP', activatedAt: new Date() } });
      return updatedUser;
    });

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    const tokens = await createTokenPair(user, res);

    res.json({ success: true, data: { token: tokens.token, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, pan: user.pan } } });
  } catch (error) { next(error); }
});

export default router;