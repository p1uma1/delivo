import { sendEmail } from '../channels/email';
import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:handlers');

export async function handleOrderCreated(payload: any) {
  logger.info(`Handling order.created for order ${payload.orderId}`);

  // Notify customer
  await sendEmail({
    to: payload.email || 'customer@example.com', // In real world, fetch from User service if not in payload
    subject: 'Order Received - Delivo',
    body: `Hi! Your order ${payload.orderId} has been received and is being processed. Pickup from: ${payload.pickupAddress}`,
  });
}
