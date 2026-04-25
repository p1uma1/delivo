import { subscribeEvent, createLogger } from '@delivo/shared';
import { orderService } from '../services/order.service';
import { OrderStatus } from '../repositories/order.repository';

const logger = createLogger('order-service:events');

export async function initOrderSubscribers() {
  // Listen for rider assignment
  await subscribeEvent<{ orderId: string }>(
    'order-service.delivery-assigned',
    'delivery.assigned',
    async (payload) => {
      logger.info(`Updating order ${payload.orderId} to ASSIGNED`);
      await orderService.updateOrderStatus(payload.orderId, 'ASSIGNED');
    }
  );

  // Listen for delivery status updates (PICKED_UP, IN_TRANSIT)
  await subscribeEvent<{ orderId: string; status: OrderStatus }>(
    'order-service.delivery-status-updated',
    'delivery.status.updated',
    async (payload) => {
      // Prevent reverting DELIVERED or updating back to PENDING unnecessarily
      if (payload.status === 'PICKED_UP' || payload.status === 'IN_TRANSIT') {
        logger.info(`Updating order ${payload.orderId} to ${payload.status}`);
        await orderService.updateOrderStatus(payload.orderId, payload.status);
      }
    }
  );

  // Listen for delivery completion
  await subscribeEvent<{ orderId: string }>(
    'order-service.delivery-completed',
    'delivery.completed',
    async (payload) => {
      logger.info(`Updating order ${payload.orderId} to DELIVERED`);
      await orderService.updateOrderStatus(payload.orderId, 'DELIVERED');
    }
  );
}
