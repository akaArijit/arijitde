import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ApiError } from '../lib/api-error';

export interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

export function validate(schemas: ValidationOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.headers) {
        req.headers = await schemas.headers.parseAsync(req.headers);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(ApiError.fromZodError(error));
      }
      next(error);
    }
  };
}

// Common validation schemas
export const commonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Invalid PAN format'),
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    cursor: z.string().optional(),
    cursorId: z.string().optional(),
  }),
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).refine((data) => {
    if (data.from && data.to) {
      return new Date(data.from) <= new Date(data.to);
    }
    return true;
  }, { message: 'from date must be before to date' }),
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

// Validation middleware factory for common patterns
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return validate({ body: schema });
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
  return validate({ query: schema });
}

export function validateParams<T extends z.ZodTypeAny>(schema: T) {
  return validate({ params: schema });
}

export function validateHeaders<T extends z.ZodTypeAny>(schema: T) {
  return validate({ headers: schema });
}

// Combined validation
export function validateAll(schemas: ValidationOptions) {
  return validate(schemas);
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  // Recursively sanitize string values in body
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  next();
}

// Rate limiting with validation context
export function createValidationRateLimiter(
  windowMs: number,
  max: number,
  message: string
) {
  return (req: Request, res: Response, next: NextFunction) => {
    // This would integrate with express-rate-limit
    // For now, just pass through
    next();
  };
}

// File upload validation
export const fileValidationSchemas = {
  excel: z.object({
    mimetype: z.enum([
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]),
    size: z.number().max(10 * 1024 * 1024), // 10MB
  }),
  image: z.object({
    mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    size: z.number().max(5 * 1024 * 1024), // 5MB
  }),
  document: z.object({
    mimetype: z.enum([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]),
    size: z.number().max(10 * 1024 * 1024), // 10MB
  }),
};

// Validation error formatter for consistent API responses
export function formatValidationError(error: ZodError): {
  success: false;
  error: string;
  details: Array<{
    field: string;
    message: string;
    code: string;
  }>;
} {
  return {
    success: false,
    error: 'Validation failed',
    details: error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
}