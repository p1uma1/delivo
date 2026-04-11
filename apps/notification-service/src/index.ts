import { connectRabbitMQ, subscribeEvent, createLogger } from '@delivo/shared';
import { handleOrderCreated } from './handlers/orderCreated';
import { handleDeliveryAssigned } from './handlers/deliveryAssigned';
import { handleDeliveryStatusUpdated } from './handlers/deliveryUpdated';

const logger = createLogger('notification-service');

async function start() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Subscribe to all relevant events
    // Exchange is 'delivo.events' (topic)
    
    // 1. Order Created
    await subscribeEvent(
      'notification-service.order-created',
      'order.created',
      handleOrderCreated
    );

    // 2. Delivery Assigned
    await subscribeEvent(
      'notification-service.delivery-assigned',
      'delivery.assigned',
      handleDeliveryAssigned
    );

    // 3. Delivery Status Updated
    await subscribeEvent(
      'notification-service.delivery-status-updated',
      'delivery.status.updated',
      handleDeliveryStatusUpdated
    );

    logger.info('Notification Service initialized and listening for events');
  } catch (err) {
    logger.error('Failed to start Notification Service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();
