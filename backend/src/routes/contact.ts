import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';

const router = Router();

// Rate limiter for contact submission: max 5 messages per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error:
      'Too many contact form submissions from this IP, please try again later.',
  },
});

const contactSubmitSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be 2000 characters or less'),
});

// POST /api/contact
router.post('/', contactLimiter, async (req: Request, res: Response, next) => {
  try {
    const validated = contactSubmitSchema.parse(req.body);

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: validated.name,
        email: validated.email,
        message: validated.message,
      },
    });

    res.status(201).json({
      success: true,
      data: contactMessage,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
