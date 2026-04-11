import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:email');

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Stub implementation for MVP
  // In real world, use nodemailer with SendGrid/AWS SES/etc.
  logger.info(`[EMAIL STUB] To: ${options.to} | Subject: ${options.subject}`);
  logger.debug(`[EMAIL BODY]: ${options.body}`);
  
  // Simulate network delay
  await new Promise(res => setTimeout(res, 100));
}
