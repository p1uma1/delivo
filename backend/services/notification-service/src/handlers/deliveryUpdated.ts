import { sendEmail } from '../channels/email';
import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:handlers');

export async function handleDeliveryStatusUpdated(payload: any) {
  logger.info(`Handling delivery.status.updated for order ${payload.orderId}: ${payload.status}`);

  // Notify customer based on status
  let message = '';
  switch (payload.status) {
    case 'PICKED_UP':
      message = `Your order ${payload.orderId} has been picked up!`;
      break;
    case 'IN_TRANSIT':
      message = `Your order ${payload.orderId} is now in transit.`;
      break;
    case 'DELIVERED':
      message = `Your order ${payload.orderId} has been successfully delivered. Thank you for using Delivo!`;
      break;
  }

  if (message) {
    await sendEmail({
      to: payload.customerEmail || 'kkravishan3@gmail.com',
      subject: `Order Update: ${payload.status} - Delivo`,
      body: message,
    });
  }
}
