import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  console.error('API Error: ', err);

  if (err instanceof ZodError) {
    const errorMessages = err.issues
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    res.status(400).json({
      success: false,
      error: `Validation error - ${errorMessages}`,
    });
    return;
  }

  // Handle Token / Authorization Errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired token',
    });
    return;
  }

  // Fallback for default error handling
  const status = res.statusCode >= 400 ? res.statusCode : 500;
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(status).json({
    success: false,
    error: isProduction
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error',
  });
}
