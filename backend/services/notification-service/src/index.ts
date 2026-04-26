import { connectRabbitMQ, subscribeEvent, createLogger } from '@delivo/shared';
import { initSocketServer } from './socket';
import { handleOrderCreated } from './handlers/orderCreated';
import { handleDeliveryAssigned } from './handlers/deliveryAssigned';
import { handleDeliveryStatusUpdated } from './handlers/deliveryUpdated';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const logger = createLogger('notification-service');

async function start() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Start Socket.io server
    const socketPort = parseInt(process.env.NOTIFICATION_SOCKET_PORT || '3006');
    initSocketServer(socketPort);

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
