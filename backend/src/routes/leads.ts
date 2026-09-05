import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { transporter } from '../services/email';
import { LeadStatus } from '@prisma/client';

const router = Router();

// Zod validation schemas
const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  scoreId: z.string().uuid().optional(),
  slot: z.preprocess((arg) => {
    if (typeof arg === 'string' && arg.trim() !== '') {
      const date = new Date(arg);
      return isNaN(date.getTime()) ? undefined : date;
    }
    if (arg instanceof Date) return arg;
    return undefined;
  }, z.date().optional()),
});

const getLeadsQuerySchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  page: z
    .preprocess((val) => Number(val || 1), z.number().int().positive())
    .default(1),
  limit: z
    .preprocess((val) => Number(val || 10), z.number().int().positive())
    .default(10),
});

const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
  notes: z.string().optional(),
});

// 1. POST /api/leads
router.post(
  '/',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const validated = createLeadSchema.parse(req.body);
      const userId = req.user!.id;

      // Create lead record
      const lead = await prisma.lead.create({
        data: {
          userId,
          name: validated.name,
          phone: validated.phone,
          scoreId: validated.scoreId || null,
          slot: validated.slot || null,
        },
      });

      if (req.user!.role === 'CLIENT') {
        const bookingSlot =
          validated.slot ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await prisma.advisorySession.create({
          data: {
            userId,
            preferredSlot1: bookingSlot,
            preferredSlot2: bookingSlot,
            preferredSlot3: bookingSlot,
            status: 'PENDING',
          },
        });
      }

      // Send confirmation email via Nodemailer
      try {
        const email = req.user!.email;
        if (email) {
          const mailOptions = {
            from: `"FinAnalysis" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Your advisory call is booked',
            text: `Hi ${validated.name}, we'll contact you at ${validated.phone}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #0F172A; text-align: center;">FinAnalysis</h2>
              <p style="font-size: 16px; color: #334155;">Hi <strong>${validated.name}</strong>,</p>
              <p style="font-size: 16px; color: #334155;">Your advisory call has been successfully booked. Our team will contact you shortly at <strong>${validated.phone}</strong>.</p>
              ${validated.slot ? `<p style="font-size: 16px; color: #334155;">Scheduled Slot: <strong>${validated.slot.toLocaleString()}</strong></p>` : ''}
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748B; text-align: center;">Thank you for choosing FinAnalysis.</p>
            </div>
          `,
          };
          transporter
            .sendMail(mailOptions)
            .catch((err) =>
              console.error(
                'Failed to send advisory booking confirmation email in background:',
                err,
              ),
            );
        }
      } catch (emailErr) {
        console.error(
          'Failed to send advisory booking confirmation email:',
          emailErr,
        );
      }

      res.status(201).json({
        success: true,
        data: { leadId: lead.id },
      });
    } catch (error) {
      next(error);
    }
  },
);

// 2. GET /api/leads (admin only)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { status, page, limit } = getLeadsQuerySchema.parse(req.query);
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.lead.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          leads,
          total,
          page,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// 3. PUT /api/leads/:id/status (admin only)
router.put(
  '/:id/status',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { id } = z
        .object({ id: z.string().uuid('Invalid lead ID format') })
        .parse(req.params);
      const { status, notes } = updateLeadStatusSchema.parse(req.body);

      const existingLead = await prisma.lead.findUnique({
        where: { id },
      });

      if (!existingLead) {
        res.status(404).json({
          success: false,
          error: 'Lead not found',
        });
        return;
      }

      const updatedLead = await prisma.lead.update({
        where: { id },
        data: {
          status,
          notes: notes !== undefined ? notes : existingLead.notes,
        },
      });

      res.json({
        success: true,
        data: updatedLead,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 4. GET /api/leads/my-bookings (user bookings)
router.get(
  '/my-bookings',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const leads = await prisma.lead.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      res.json({
        success: true,
        data: leads,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 5. GET /api/leads/availability (available slots for user)
router.get(
  '/availability',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const AVAILABILITY_FILE = path.join(
        __dirname,
        '../../uploads/availability.json',
      );
      let slots: string[] = [];
      if (fs.existsSync(AVAILABILITY_FILE)) {
        const fileContent = fs.readFileSync(AVAILABILITY_FILE, 'utf-8');
        slots = JSON.parse(fileContent) || [];
      }

      // Fetch all booked lead slots
      const bookedLeads = await prisma.lead.findMany({
        where: {
          slot: { not: null },
        },
        select: {
          slot: true,
        },
      });

      const bookedTimes = bookedLeads
        .map((l) => (l.slot ? new Date(l.slot).getTime() : 0))
        .filter((t) => t > 0);

      // Filter out slots that are already booked
      const freeSlots = slots.filter((slotStr) => {
        const slotTime = new Date(slotStr).getTime();
        return !bookedTimes.includes(slotTime);
      });

      res.json({
        success: true,
        data: freeSlots,
      });
    } catch (error) {
      next(error);
    }
  },
);

// ==========================================
// PAID ADVISORY SESSION ROUTES
// ==========================================

const bookSessionSchema = z.object({
  slot1: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 1 format',
    })
    .transform((val) => new Date(val)),
  slot2: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 2 format',
    })
    .transform((val) => new Date(val)),
  slot3: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 3 format',
    })
    .transform((val) => new Date(val)),
});

const bookSessionPublicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(5, 'Phone number must be at least 5 characters'),
  email: z.string().email('Invalid email address'),
  slot1: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 1 format',
    })
    .transform((val) => new Date(val)),
  slot2: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 2 format',
    })
    .transform((val) => new Date(val)),
  slot3: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid slot 3 format',
    })
    .transform((val) => new Date(val)),
});

const adminConfirmSessionSchema = z.object({
  confirmedSlot: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid confirmed slot format',
    })
    .transform((val) => new Date(val)),
  googleMeetLink: z.string().url('Invalid Google Meet URL format'),
});

const adminUpdateNotesSchema = z.object({
  notes: z.string().optional(),
});

// 6. POST /api/leads/book-session (user books preferred slots directly for free)
router.post(
  '/book-session',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { slot1, slot2, slot3 } = bookSessionSchema.parse(req.body);
      const userId = req.user!.id;

      // Find if user already has an advisory session
      let session = await prisma.advisorySession.findFirst({
        where: { userId },
      });

      if (session) {
        // Update slots
        session = await prisma.advisorySession.update({
          where: { id: session.id },
          data: {
            preferredSlot1: slot1,
            preferredSlot2: slot2,
            preferredSlot3: slot3,
            status: 'PENDING',
          },
        });
      } else {
        // Create new session
        session = await prisma.advisorySession.create({
          data: {
            userId,
            preferredSlot1: slot1,
            preferredSlot2: slot2,
            preferredSlot3: slot3,
            status: 'PENDING',
          },
        });
      }

      res.json({
        success: true,
        data: session,
        message: 'Slots registered. Arijit will confirm your schedule soon.',
      });
    } catch (error) {
      next(error);
    }
  },
);

// 6.5. POST /api/leads/book-session-public (public route to book preferred slots directly)
router.post(
  '/book-session-public',
  async (req: Request, res: Response, next) => {
    try {
      const { name, phone, email, slot1, slot2, slot3 } =
        bookSessionPublicSchema.parse(req.body);

      const emailNormalized = email.trim().toLowerCase();

      // Find or create User with role GUEST
      let user = await prisma.user.findFirst({
        where: { email: emailNormalized },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: emailNormalized,
            name: name.trim(),
            phone: phone.trim(),
            role: 'GUEST',
          },
        });
      } else {
        // Update missing phone/name fields on existing user
        const updateData: any = {};
        if (!user.name) updateData.name = name.trim();
        if (!user.phone) updateData.phone = phone.trim();
        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          });
        }
      }

      // Create a new AdvisorySession linked to the user
      const session = await prisma.advisorySession.create({
        data: {
          userId: user.id,
          preferredSlot1: slot1,
          preferredSlot2: slot2,
          preferredSlot3: slot3,
          status: 'PENDING',
        },
      });

      res.json({
        success: true,
        data: session,
        message: 'Slots registered. Arijit will confirm your schedule soon.',
      });
    } catch (error) {
      next(error);
    }
  },
);

// 7. GET /api/leads/my-sessions (view user's own advisory sessions)
router.get(
  '/my-sessions',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const sessions = await prisma.advisorySession.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 8. GET /api/admin/sessions (admin queue, admin only)
router.get(
  '/admin/sessions',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const sessions = await prisma.advisorySession.findMany({
        include: {
          user: {
            select: { name: true, phone: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  },
);

// 9. POST /api/admin/sessions/:id/confirm (confirm slot, admin only)
router.post(
  '/admin/sessions/:id/confirm',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const id = req.params.id as string;
      const { confirmedSlot, googleMeetLink } = adminConfirmSessionSchema.parse(
        req.body,
      );

      const session = (await prisma.advisorySession.findUnique({
        where: { id },
        include: { user: true },
      })) as any;

      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }

      const updated = await prisma.advisorySession.update({
        where: { id },
        data: {
          confirmedSlot,
          googleMeetLink,
          status: 'CONFIRMED',
        },
      });

      // Notify user via email
      try {
        if (session.user.email) {
          const mailOptions = {
            from: `"Arijit De | FinAnalysis" <${process.env.GMAIL_USER}>`,
            to: session.user.email,
            subject: 'Advisory Call Confirmed - Google Meet Link Inside',
            text: `Hi ${session.user.name || 'Investor'},\n\nYour 1-on-1 live advisory session is confirmed.\nScheduled Time: ${confirmedSlot.toLocaleString()}\nGoogle Meet: ${googleMeetLink}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #4F46E5; text-align: center; margin-top: 0;">FinAnalysis</h2>
              <h3 style="color: #1E293B; margin-bottom: 20px;">Live Session Confirmed</h3>
              <p style="font-size: 15px; color: #475569; line-height: 1.6;">Hi <strong>${session.user.name || 'Investor'}</strong>,</p>
              <p style="font-size: 15px; color: #475569; line-height: 1.6;">Your 1-on-1 portfolio review session with Arijit De has been scheduled and confirmed.</p>
              
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748B;"><strong>SCHEDULED TIME:</strong></p>
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #0F172A; font-family: monospace;">${confirmedSlot.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)</p>
                
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748B;"><strong>GOOGLE MEET LINK:</strong></p>
                <a href="${googleMeetLink}" style="font-size: 15px; color: #2563EB; word-break: break-all; font-weight: bold;" target="_blank">${googleMeetLink}</a>
              </div>
              
              <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 30px; border-top: 1px solid #F1F5F9; padding-top: 15px;">
                Note: If you need to reschedule or refund, contact us. Otherwise, please join the meet link 5 minutes before time.
              </p>
            </div>
          `,
          };
          transporter
            .sendMail(mailOptions)
            .catch((err) =>
              console.error(
                'Failed to send session confirmation email in background:',
                err,
              ),
            );
        }
      } catch (emailErr) {
        console.error('Failed to send session confirmation email:', emailErr);
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
);

// 10. POST /api/admin/sessions/:id/notes (update notes, admin only)
router.post(
  '/admin/sessions/:id/notes',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const id = req.params.id as string;
      const { notes } = adminUpdateNotesSchema.parse(req.body);

      const session = await prisma.advisorySession.findUnique({
        where: { id },
      });
      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }

      const updated = await prisma.advisorySession.update({
        where: { id },
        data: { notes },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
);

// 11. POST /api/admin/sessions/:id/refund (cancel session, admin only)
router.post(
  '/admin/sessions/:id/refund',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const id = req.params.id as string;

      const session = await prisma.advisorySession.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!session) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }

      if (session.status === 'REFUNDED') {
        res
          .status(400)
          .json({ success: false, error: 'Session is already cancelled' });
        return;
      }

      // Update status to REFUNDED in database
      await prisma.advisorySession.update({
        where: { id },
        data: { status: 'REFUNDED' },
      });

      // Send cancellation email notification
      try {
        if (session.user.email) {
          const mailOptions = {
            from: `"Arijit De | FinAnalysis" <${process.env.GMAIL_USER}>`,
            to: session.user.email,
            subject: 'Cancellation Confirmed - Live Advisory Session',
            text: `Hi ${session.user.name || 'Investor'},\n\nWe have cancelled your scheduled live session.`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #fca5a5; border-radius: 12px; background-color: #fffaf0;">
              <h2 style="color: #DC2626; text-align: center; margin-top: 0;">FinAnalysis</h2>
              <h3 style="color: #991B1B; margin-bottom: 20px;">Session Cancelled</h3>
              <p style="font-size: 15px; color: #7F1D1D; line-height: 1.6;">Hi <strong>${session.user.name || 'Investor'}</strong>,</p>
              <p style="font-size: 15px; color: #7F1D1D; line-height: 1.6;">
                We have cancelled your scheduled advisory session. If you want to re-schedule, please visit your dashboard.
              </p>
              <div style="border-top: 1px solid #FECACA; margin-top: 30px; padding-top: 15px; font-size: 12px; color: #B91C1C; text-align: center;">
                If you have any questions, reply to this email. We appreciate your trust in us.
              </div>
            </div>
          `,
          };
          transporter
            .sendMail(mailOptions)
            .catch((err) =>
              console.error(
                'Failed to send cancellation notification email in background:',
                err,
              ),
            );
        }
      } catch (emailErr) {
        console.error(
          'Failed to send cancellation notification email:',
          emailErr,
        );
      }

      res.json({ success: true, message: 'Session successfully cancelled.' });
    } catch (error) {
      next(error);
    }
  },
);

// 12. DELETE /api/leads/admin/sessions/:id (delete slot, admin only)
router.delete(
  '/admin/sessions/:id',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const id = req.params.id as string;
      const deletedSession = await prisma.advisorySession.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: `Successfully deleted advisory session.`,
        data: deletedSession,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
