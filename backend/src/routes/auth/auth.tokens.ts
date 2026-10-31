import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createHash } from 'crypto';
import {
  generateOTP,
  sendOTP,
  saveOTP,
  verifyOTP,
  deleteOTP,
} from '../../services/otp';
import { prisma } from '../../lib/prisma';
import {
  signToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../lib/jwt';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth';
import type { AuthenticatedRequest } from '../../middleware/auth';
import { OAuth2Client } from 'google-auth-library';
import { ApiError } from '../../lib/api-error';
import { generateUniqueReferralCode } from '../../utils';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const REFRESH_ENABLED = process.env.ENABLE_REFRESH_TOKENS === 'true';

export async function createTokenPair(
  user: { id: string; email: string | null; role: any },
  res: Response,
) {
  if (REFRESH_ENABLED) {
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email ?? '',
      role: user.role,
    });
    const refreshToken = signRefreshToken(user.id);
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: { token: tokenHash, userId: user.id, expiresAt },
    });

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

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    if (!REFRESH_ENABLED) {
      return next(ApiError.notFound('Refresh tokens not enabled'));
    }

    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return next(ApiError.unauthorized('Refresh token required'));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return next(ApiError.unauthorized('Invalid or expired refresh token'));
    }

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

    // Use a transaction to atomically find and consume the refresh token
    // This prevents race conditions where the same token could be used concurrently
    const result = await prisma.$transaction(async (tx) => {
      const matchedToken = await tx.refreshToken.findUnique({
        where: { token: tokenHash, expiresAt: { gt: new Date() } },
      });

      if (!matchedToken || matchedToken.userId !== decoded.userId) {
        await tx.refreshToken.deleteMany({ where: { userId: decoded.userId } });
        return { error: 'revoked' };
      }

      if (matchedToken.expiresAt < new Date()) {
        await tx.refreshToken.delete({ where: { id: matchedToken.id } });
        return { error: 'expired' };
      }

      // Atomically consume the token - delete it as part of the same transaction
      const deleted = await tx.refreshToken.delete({
        where: { id: matchedToken.id },
      });

      if (!deleted) {
        // Token was already consumed by another request
        await tx.refreshToken.deleteMany({ where: { userId: decoded.userId } });
        return { error: 'reuse' };
      }

      // Clean up expired tokens
      await tx.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });

      const user = await tx.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return { error: 'user_not_found' };
      }

      return { user };
    });

    if (result.error === 'revoked') {
      res.clearCookie('refreshToken', { path: '/' });
      return next(ApiError.unauthorized('Refresh token revoked — all sessions terminated'));
    }
    if (result.error === 'expired') {
      res.clearCookie('refreshToken', { path: '/' });
      return next(ApiError.unauthorized('Refresh token expired'));
    }
    if (result.error === 'reuse') {
      return next(ApiError.unauthorized('Refresh token reuse detected — all sessions terminated'));
    }
    if (result.error === 'user_not_found' || !result.user) {
      return next(ApiError.unauthorized('User not found'));
    }

    const tokens = await createTokenPair(result.user!, res);
    res.json({ success: true, data: { token: tokens.token } });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
    }
    if (req.user && req.body?.allDevices === true) {
      await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });
    }
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;