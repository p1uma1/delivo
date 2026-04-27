import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:handlers');

export async function handleDeliveryAssigned(payload: any) {
  logger.info(`Handling delivery.assigned for order ${payload.orderId}`);

  // We are currently only using Socket.io for notifications
}
