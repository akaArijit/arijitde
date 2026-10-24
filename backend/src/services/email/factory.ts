import { logger } from '../../lib/logger';
import { GmailProvider } from './gmail.provider';
import { ResendProvider } from './resend.provider';
import { EmailProvider, type SendResult } from './provider';

export type EmailProviderType = 'gmail' | 'resend';

function getProviderType(): EmailProviderType {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase();
  if (provider === 'resend') return 'resend';
  return 'gmail';
}

let cachedProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider;

  const type = getProviderType();

  switch (type) {
    case 'resend':
      try {
        cachedProvider = new ResendProvider();
        logger.info({ provider: 'resend' }, 'Email provider selected');
        return cachedProvider;
      } catch (error) {
        logger.warn({ err: error, fallback: 'gmail' }, 'Resend provider failed to initialize, falling back to Gmail');
        cachedProvider = new GmailProvider();
        return cachedProvider;
      }
    case 'gmail':
    default:
      cachedProvider = new GmailProvider();
      logger.info({ provider: 'gmail' }, 'Email provider selected');
      return cachedProvider;
  }
}

export async function sendEmailWithProvider(
  provider: EmailProvider,
  options: { to: string; subject: string; html: string; from?: string }
): Promise<SendResult> {
  return provider.sendEmail(options);
}