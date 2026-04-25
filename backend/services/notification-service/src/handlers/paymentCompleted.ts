import { sendEmail } from '../channels/email';
import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:handlers');

export async function handlePaymentCompleted(payload: any) {
  logger.info(`Handling payment.completed for payment ${payload.paymentId} (Order: ${payload.orderId})`);

  // Notify customer
  await sendEmail({
    to: payload.customerEmail || 'kkravishan3@gmail.com', 
    subject: 'Payment Successful - Delivo',
    body: `Great news! Your payment of $${payload.amount} for order ${payload.orderId} was successful.`,
  });
}
