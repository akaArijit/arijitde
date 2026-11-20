import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { authMiddleware } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { OAuth2Client } from 'google-auth-library';
import { ApiError } from '../../lib/api-error';
import rateLimit from 'express-rate-limit';
import { generateOTP, sendOTP, saveOTP, verifyOTP, deleteOTP } from '../../services/otp';
import { signToken, signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { generateUniqueReferralCode, createTokenPair } from '../../utils/auth';

const PAN_VERIFICATION_SECRET = process.env.PAN_VERIFICATION_SECRET!;
if (!PAN_VERIFICATION_SECRET) {
  throw new Error('PAN_VERIFICATION_SECRET environment variable is required for PAN verification tokens.');
}

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many authentication attempts. Please wait 15 minutes and try again.' },
});

// 3. POST /api/auth/google
const googleAuthSchema = z.object({
  token: z.string().min(1, 'Google token is required'),
  referredBy: z.string().optional(),
});

router.post('/google', authLimiter, async (req: Request, res: Response, next) => {
  try {
    const { token, referredBy } = googleAuthSchema.parse(req.body);

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) return next(ApiError.badRequest('Invalid Google token payload'));

    const { email, sub: googleId, name } = payload;
    const formattedEmail = email.toLowerCase();

    let user = await prisma.user.findUnique({ where: { googleId } });

    if (user && user.role === 'CLIENT' && !user.pan) {
      const clientRecords = await prisma.existingClient.findMany({ where: { email: { equals: formattedEmail, mode: 'insensitive' } } });
      if (clientRecords.length > 0) {
        const accounts = clientRecords.map((c) => {
          const pan = c.pan || '';
          const panMasked = pan.length >= 4 ? '*'.repeat(pan.length - 4) + pan.substring(pan.length - 4) : 'N/A';
          return { id: c.id, name: c.name || 'N/A', panMasked };
        });

        const tempToken = jwt.sign({ email: formattedEmail, googleId, purpose: 'client_pan_verification' }, PAN_VERIFICATION_SECRET, { expiresIn: '15m' });
        res.json({ success: true, data: { requiresSelection: true, accounts, tempToken, email: formattedEmail } });
        return;
      }
    }

    if (!user) {
      const clientRecords = await prisma.existingClient.findMany({ where: { email: { equals: formattedEmail, mode: 'insensitive' } } });
      if (clientRecords.length > 0) {
        const accounts = clientRecords.map((c) => {
          const pan = c.pan || '';
          const panMasked = pan.length >= 4 ? '*'.repeat(pan.length - 4) + pan.substring(pan.length - 4) : 'N/A';
          return { id: c.id, name: c.name || 'N/A', panMasked };
        });

        const tempToken = jwt.sign({ email: formattedEmail, googleId, purpose: 'client_pan_verification' }, PAN_VERIFICATION_SECRET, { expiresIn: '15m' });
        res.json({ success: true, data: { requiresSelection: true, accounts, tempToken, email: formattedEmail } });
        return;
      }

      user = await prisma.user.findFirst({ where: { email: formattedEmail } });
      if (user) {
        user = await prisma.user.update({ where: { id: user.id }, data: { googleId, name: user.name || name || null } });
      } else {
        let referrerId: string | null = null;
        if (referredBy) {
          const referrerUser = await prisma.user.findUnique({ where: { referralCode: referredBy.trim().toUpperCase() } });
          if (referrerUser) referrerId = referrerUser.id;
        }
        const refCode = await generateUniqueReferralCode();
        user = await prisma.user.create({ data: { email: formattedEmail, googleId, name: name || null, role: 'GUEST', referralCode: refCode, referrerId: referrerId || null } });
      }
    }

    if (user.role !== 'ADMIN' && user.role !== 'CLIENT') {
      const clientRecords = await prisma.existingClient.findMany({ where: { email: { equals: formattedEmail, mode: 'insensitive' } } });
      if (clientRecords.length === 1) {
        const clientRecord = clientRecords[0]!;
        user = await prisma.user.update({ where: { id: user.id }, data: { role: 'CLIENT', name: user.name || clientRecord.name || null } });
        await prisma.client.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id, activePlan: 'PREMIUM', advisorNotes: 'Logged in via Google OAuth', activatedAt: new Date() } });
      }
    }

    const tokens = await createTokenPair(user, res);
    res.json({ success: true, data: { token: tokens.token, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, pan: user.pan } } });
  } catch (error) { return next(ApiError.badRequest('Invalid or expired Google token')); }
});

export default router;