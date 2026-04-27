import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:handlers');

export async function handleDeliveryStatusUpdated(payload: any) {
  logger.info(`Handling delivery.status.updated for order ${payload.orderId}: ${payload.status}`);

  // We are currently only using Socket.io for notifications
}
