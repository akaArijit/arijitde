export type { EmailProvider, EmailOptions, SendResult } from './provider';
export { BaseEmailProvider } from './provider';
export { GmailProvider } from './gmail.provider';
export { ResendProvider } from './resend.provider';
export { getEmailProvider, sendEmailWithProvider, type EmailProviderType } from './factory';