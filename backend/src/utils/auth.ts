import { prisma } from '../lib/prisma';
import { createHash } from 'crypto';
import { signAccessToken, signRefreshToken } from '../lib/jwt';
import type { Response } from 'express';

const REFRESH_ENABLED = process.env.ENABLE_REFRESH_TOKENS === 'true';

export interface TokenUser {
  id: string;
  email: string | null;
  role: any;
}

export interface TokenPair {
  token: string;
  refreshToken?: string;
}

export async function createTokenPair(
  user: TokenUser,
  res: Response,
): Promise<TokenPair> {
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
  return { token: signAccessToken({ userId: user.id, email: user.email ?? '', role: user.role }) };
}

export async function generateUniqueReferralCode() {
  let referralCode = '';
  let isUnique = false;
  while (!isUnique) {
    referralCode = 'FIN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.user.findUnique({ where: { referralCode } });
    if (!existing) isUnique = true;
  }
  return referralCode;
}