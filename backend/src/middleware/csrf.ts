import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.includes(req.method)) {
    // Set a new CSRF token in a cookie for safe methods
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = generateToken();
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // Must be readable by JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    return next();
  }

  // Exempt requests with a VALID Bearer token (authenticated API clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      verifyAccessToken(authHeader.substring(7));
      return next(); // Valid access token — skip CSRF
    } catch {
      // Invalid/expired token — fall through to CSRF validation
    }
  }

  // Validate double-submit cookie using timing-safe comparison
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] as string | undefined;

  if (!cookieToken || !headerToken) {
    res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token',
    });
    return;
  }

  // Use timing-safe comparison to prevent timing attacks
  const cookieTokenBuf = Buffer.from(cookieToken);
  const headerTokenBuf = Buffer.from(headerToken);
  if (cookieTokenBuf.length !== headerTokenBuf.length || !crypto.timingSafeEqual(cookieTokenBuf, headerTokenBuf)) {
    res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token',
    });
    return;
  }

  next();
}
