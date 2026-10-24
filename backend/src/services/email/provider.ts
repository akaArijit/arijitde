import { logger } from '../../lib/logger';

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<SendResult>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface SendResult {
  success: boolean;
  uncertain?: boolean;
  error?: Error;
}

export abstract class BaseEmailProvider implements EmailProvider {
  protected readonly fromEmail: string;

  constructor(fromEmail: string) {
    this.fromEmail = fromEmail;
  }

  abstract sendEmail(options: EmailOptions): Promise<SendResult>;

  protected buildMailOptions(options: EmailOptions) {
    return {
      from: options.from || this.fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };
  }

  protected handleSuccess(provider: string, options: EmailOptions): SendResult {
    logger.info({ to: options.to, subject: options.subject, provider }, 'Email sent successfully');
    return { success: true };
  }

  protected handleError(provider: string, options: EmailOptions, error: unknown): SendResult {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ err, to: options.to, subject: options.subject, provider }, 'Failed to send email');
    return { success: false, error: err };
  }
}