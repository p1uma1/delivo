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
      logger.info(`Updating order ${payload.orderId} to rider selected`);
      await orderService.updateOrderStatus(payload.orderId, 'rider_selected');
    }
  );

  // Listen for delivery completion
  await subscribeEvent<{ orderId: string }>(
    'order-service.delivery-completed',
    'delivery.completed',
    async (payload) => {
      logger.info(`Updating order ${payload.orderId} to delivered`);
      await orderService.updateOrderStatus(payload.orderId, 'delivered');
    }
  );
}
