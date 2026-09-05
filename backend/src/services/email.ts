import nodemailer from 'nodemailer';

// Nodemailer transport fallback for local development
const nodemailerTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const transporter = {
  sendMail: async (options: {
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) => {
    // If BREVO_API_KEY is configured, send via Brevo HTTP API (Port 443 - works on Render)
    if (process.env.BREVO_API_KEY) {
      const senderEmail = process.env.GMAIL_USER || '0day.ashish@gmail.com';
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: 'FinAnalysis',
            email: senderEmail,
          },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html || options.text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Brevo API Error: ${response.status} - ${errorText}`);
      }
      return { messageId: 'brevo-api' };
    }

    // Fallback to SMTP nodemailer for local testing
    return nodemailerTransporter.sendMail(options);
  },
};
