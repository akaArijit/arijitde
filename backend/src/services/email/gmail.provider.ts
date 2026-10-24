import nodemailer from 'nodemailer';
import dns from 'dns';
import { logger } from '../../lib/logger';
import { BaseEmailProvider, type EmailOptions, type SendResult } from './provider';

function parsePositiveInt(name: string, value: string | undefined, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: must be a positive integer, got "${value}"`);
  }
  return parsed;
}

export class GmailProvider extends BaseEmailProvider {
  private readonly transporter: nodemailer.Transporter;
  private readonly emailSendTimeout: number;

  constructor() {
    const fromEmail = process.env.GMAIL_USER ? `"FinAnalysis" <${process.env.GMAIL_USER}>` : 'FinAnalysis <noreply@finanalysis.site>';
    super(fromEmail);

    const connectionTimeout = parsePositiveInt('SMTP_CONNECTION_TIMEOUT', process.env.SMTP_CONNECTION_TIMEOUT, 10000);
    const greetingTimeout = parsePositiveInt('SMTP_GREETING_TIMEOUT', process.env.SMTP_GREETING_TIMEOUT, 5000);
    const socketTimeout = parsePositiveInt('SMTP_SOCKET_TIMEOUT', process.env.SMTP_SOCKET_TIMEOUT, 10000);
    this.emailSendTimeout = parsePositiveInt('EMAIL_SEND_TIMEOUT', process.env.EMAIL_SEND_TIMEOUT, 15000);

    // Known Gmail SMTP IPv4 addresses (as of 2024) - used as fallback when DNS resolution fails
    const GMAIL_SMTP_IPV4_ADDRESSES = [
      '74.125.133.108',
      '74.125.193.108',
      '74.125.67.108',
      '74.125.133.109',
      '74.125.193.109',
    ];

    // Allow explicit IPv4 host via env var, fallback to known IPs, then DNS with IPv4 forced
    const smtpHost = process.env.GMAIL_SMTP_HOST || GMAIL_SMTP_IPV4_ADDRESSES[0];

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false,
      family: 4,
      lookup: (hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => {
        dns.lookup(hostname, { family: 4 }, callback);
      },
      connectionTimeout,
      greetingTimeout,
      socketTimeout,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    } as nodemailer.TransportOptions);

    logger.info({ host: smtpHost, port: 587, explicitIP: !process.env.GMAIL_SMTP_HOST }, 'Gmail provider initialized with IPv4');
  }

  async sendEmail(options: EmailOptions): Promise<SendResult> {
    const mailOptions = this.buildMailOptions(options);

    logger.info({ to: options.to, subject: options.subject }, 'SMTP connecting');
    const sendMailPromise = this.transporter.sendMail(mailOptions);
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Email send timeout')), this.emailSendTimeout);
    });
    logger.info({ to: options.to, subject: options.subject }, 'SMTP sending');
    try {
      await Promise.race([sendMailPromise, timeoutPromise]);
      return this.handleSuccess('gmail', options);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email send timeout') {
        logger.warn({ to: options.to, subject: options.subject }, 'Email send timed out - delivery uncertain');
        return { success: false, uncertain: true, error };
      }
      return this.handleError('gmail', options, error);
    } finally {
      clearTimeout(timeoutId!);
    }
  }
}