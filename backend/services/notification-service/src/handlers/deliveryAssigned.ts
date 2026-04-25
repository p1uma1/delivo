import { sendEmail } from '../channels/email';
import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:handlers');

export async function handleDeliveryAssigned(payload: any) {
  logger.info(`Handling delivery.assigned for order ${payload.orderId}`);

  // Notify customer
  await sendEmail({
    to: payload.customerEmail || 'kkravishan3@gmail.com',
    subject: 'Rider Assigned - Delivo',
    body: `Good news! A rider has been assigned to your order ${payload.orderId}. They are on their way to the pickup point.`,
  });

  // Could also notify the rider via SMS
}
