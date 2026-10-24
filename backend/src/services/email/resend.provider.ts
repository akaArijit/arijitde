import { Resend } from 'resend';
import { logger } from '../../lib/logger';
import { BaseEmailProvider, type EmailOptions, type SendResult } from './provider';

export class ResendProvider extends BaseEmailProvider {
  private readonly resend: Resend;

  constructor() {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'FinAnalysis <noreply@finanalysis.site>';
    super(fromEmail);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required for Resend provider');
    }

    this.resend = new Resend(apiKey);
    logger.info({ from: fromEmail }, 'Resend provider initialized');
  }

  async sendEmail(options: EmailOptions): Promise<SendResult> {
    const mailOptions = this.buildMailOptions(options);

    logger.info({ to: options.to, subject: options.subject, provider: 'resend' }, 'Sending email via Resend');
    try {
      const { data, error } = await this.resend.emails.send({
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });

      if (error) {
        throw new Error(`Resend API error: ${error.message}`);
      }

      logger.info({ to: options.to, subject: options.subject, id: data?.id }, 'Resend email sent successfully');
      return { success: true };
    } catch (error) {
      return this.handleError('resend', options, error);
    }
  }
}