import { createLogger } from '@delivo/shared';
import nodemailer from 'nodemailer';

const logger = createLogger('notification-service:email');

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Use environment variables if they exist
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        servername: 'smtp.gmail.com'
      }
    });
    return transporter;
  }

  // Otherwise, automatically generate a test account from Ethereal
  logger.info('No SMTP credentials found in .env. Generating a test Ethereal account...');
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, 
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });
  
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const tp = await getTransporter();
    
    const info = await tp.sendMail({
      from: '"Delivo Notifications" <kkravishan3@gmail.com>',
      to: options.to,
      subject: options.subject,
      text: options.body,
    });

    logger.info(`[EMAIL SENT] To: ${options.to} | MessageId: ${info.messageId}`);
    
    // Log the preview URL if using Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`[ETHEREAL PREVIEW URL] View email here: ${previewUrl}`);
    }
  } catch (error: any) {
    logger.error(`[EMAIL ERROR] Failed to send email to ${options.to}: ${error.message}`);
  }
}

