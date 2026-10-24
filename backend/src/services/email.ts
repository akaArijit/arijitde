import fs from 'fs';
import nodemailer from 'nodemailer';
import nunjucks from 'nunjucks';
import path from 'path';
import { logger } from '../lib/logger';
import { getEmailProvider } from './email/factory';

const templateDir = fs.existsSync(path.resolve(__dirname, '../templates'))
  ? path.resolve(__dirname, '../templates')
  : path.resolve(__dirname, '../../src/templates');

const templatesEnv = nunjucks.configure(templateDir, {
  autoescape: true,
  noCache: process.env.NODE_ENV !== 'production',
});

const ALLOWED_TEMPLATES = new Set([
  'otp',
  'password-reset',
  'password-reset-confirm',
  'welcome',
  'contact',
  'support-query',
  'booking-confirmation',
]);

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export async function sendTemplatedEmail({ to, subject, template, data }: EmailOptions): Promise<{ success: boolean; uncertain?: boolean; error?: Error }> {
  if (!ALLOWED_TEMPLATES.has(template)) {
    throw new Error(`Invalid email template: ${template}. Allowed: ${Array.from(ALLOWED_TEMPLATES).join(', ')}`);
  }
  try {
    const html = templatesEnv.render(`emails/${template}.njk`, {
      ...data,
      year: new Date().getFullYear(),
    });

    const provider = getEmailProvider();
    const result = await provider.sendEmail({
      to,
      subject,
      html,
    });

    return result;
  } catch (error) {
    logger.error({ err: error, to, subject, template }, 'Failed to send email');
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
  }
}

export async function sendOTPEmail(email: string, otp: string, name?: string): Promise<void> {
  const result = await sendTemplatedEmail({
    to: email,
    subject: 'Your FinAnalysis Verification Code',
    template: 'otp',
    data: { otp, name },
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to send OTP email');
  }
}

export async function sendPasswordResetEmail(email: string, otp: string, name?: string): Promise<void> {
  const result = await sendTemplatedEmail({
    to: email,
    subject: 'Reset Your FinAnalysis Password',
    template: 'password-reset',
    data: { otp, name },
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to send password reset email');
  }
}

export async function sendPasswordResetConfirmationEmail(email: string, name?: string): Promise<void> {
  const result = await sendTemplatedEmail({
    to: email,
    subject: 'Password Reset Successful',
    template: 'password-reset-confirm',
    data: { name, loginUrl: `${process.env.FRONTEND_URL}/auth/login` },
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to send password reset confirmation email');
  }
}

export async function sendWelcomeEmail(email: string, name?: string, dashboardUrl?: string, helpUrl?: string): Promise<void> {
  const result = await sendTemplatedEmail({
    to: email,
    subject: 'Welcome to FinAnalysis!',
    template: 'welcome',
    data: { name, dashboardUrl: dashboardUrl || `${process.env.FRONTEND_URL}/dashboard`, helpUrl: helpUrl || `${process.env.FRONTEND_URL}/help` },
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to send welcome email');
  }
}

function getRecipientEmail(): string {
  const email = process.env.CONTACT_EMAIL || process.env.SUPPORT_EMAIL || process.env.GMAIL_USER;

  if (!email) {
    throw new Error(
      'Email recipient not configured. Set CONTACT_EMAIL, SUPPORT_EMAIL, or GMAIL_USER environment variable.'
    );
  }

  return email;
}

export async function sendContactNotificationEmail(data: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const result = await sendTemplatedEmail({
    to: getRecipientEmail(),
    subject: 'New Contact Form Submission',
    template: 'contact',
    data: { name: data.name, email: data.email, message: data.message },
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to send contact notification email');
  }
}

export async function sendSupportQueryNotificationEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const result = await sendTemplatedEmail({
    to: getRecipientEmail(),
    subject: `New Support Query: ${data.subject}`,
    template: 'support-query',
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    },
  });
  if (!result.success) {
    throw result.error ?? new Error('Failed to send support query notification email');
  }
}