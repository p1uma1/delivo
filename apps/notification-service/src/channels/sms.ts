import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:sms');

export interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<void> {
  // Stub implementation for MVP
  // In real world, use Twilio/Vonage/etc.
  logger.info(`[SMS STUB] To: ${options.to} | Message: ${options.message}`);
  
  // Simulate network delay
  await new Promise(res => setTimeout(res, 100));
}
