import { sendEmail } from '../channels/email';
import { createLogger } from '@delivo/shared';
import { sendNotificationToUser } from '../socket';

const logger = createLogger('notification-service:handlers');

export async function handleOrderCreated(payload: any) {
  logger.info(`Handling order.created for order ${payload.orderId}`);

  // Notify customer via email
  await sendEmail({
    to: payload.email || 'customer@example.com',
    subject: 'Order Received - Delivo',
    body: `Hi! Your order ${payload.orderId} has been received and is being processed.`,
  });

  // Notify customer via socket
  sendNotificationToUser(payload.customerId, 'notification', {
    id: Date.now().toString(),
    title: 'Order Received',
    message: `Your order #${payload.orderId.substring(0, 8)} is being processed!`,
    type: 'success',
    timestamp: new Date().toISOString()
  });

  // Notify merchant
  if (payload.merchantId) {
    sendNotificationToUser(payload.merchantId, 'notification', {
      id: Date.now().toString() + '_m',
      title: 'New Order!',
      message: `You have a new order #${payload.orderId.substring(0, 8)}`,
      type: 'info',
      timestamp: new Date().toISOString()
    });
  }
}
