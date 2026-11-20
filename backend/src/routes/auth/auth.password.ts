import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { generateOTP, sendOTP, saveOTP, verifyOTP, deleteOTP } from '../../services/otp';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../lib/api-error';
import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from '../../config/security';

import { createTokenPair } from '../../utils/auth';

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

// POST /api/auth/admin/login
const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/admin/login', passwordLoginLimiter, async (req: Request, res: Response, next) => {
  try {
    const { email, password } = adminLoginSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const invalidCredentials = {
      success: false,
      error: 'Invalid administrator email or password.',
    };

    const user = await prisma.user.findFirst({
      where: { email: formattedEmail, role: 'ADMIN' },
    });

    if (!user || !user.password) {
      res.status(401).json(invalidCredentials);
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      res.status(401).json(invalidCredentials);
      return;
    }

    const tokens = await createTokenPair(user, res);

    res.json({
      success: true,
      data: {
        token: tokens.token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/password/reset/send-otp
const sendResetOtpSchema = z.object({ email: z.string().email('Invalid email address') });

router.post('/password/reset/send-otp', otpSendLimiter, async (req, res, next) => {
  try {
    const { email } = sendResetOtpSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const user = await prisma.user.findFirst({ where: { email: formattedEmail } });
    if (!user) return next(ApiError.notFound('User not found'));

    const otp = generateOTP();
    await saveOTP(formattedEmail, otp, 'password_reset');
    try { await sendOTP(formattedEmail, otp); }
    catch { await deleteOTP(formattedEmail, otp, 'password_reset'); return next(ApiError.internal('Failed to send OTP email')); }

    res.json({ success: true, data: { message: 'OTP sent to email successfully' } });
  } catch (error) { next(error); }
});

// POST /api/auth/password/reset/confirm
const confirmResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Password must contain at least one uppercase letter').regex(/[0-9]/, 'Password must contain at least one number'),
});

router.post('/password/reset/confirm', authLimiter, async (req, res, next) => {
  try {
    const { email, otp, password } = confirmResetSchema.parse(req.body);
    const formattedEmail = email.toLowerCase();

    const isValid = await verifyOTP(formattedEmail, otp, 'password_reset');
    if (!isValid) return next(ApiError.badRequest('Invalid or expired reset OTP.'));

    const hashedPassword = await bcrypt.hash(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
    const userToUpdate = await prisma.user.findFirst({ where: { email: formattedEmail } });
    if (!userToUpdate) return next(ApiError.notFound('User not found'));

    await prisma.user.update({ where: { id: userToUpdate.id }, data: { password: hashedPassword } });
    await prisma.refreshToken.deleteMany({ where: { userId: userToUpdate.id } });

    res.json({ success: true, data: { message: 'Password has been reset successfully. Please log in.' } });
  } catch (error) { next(error); }
});

export default router;