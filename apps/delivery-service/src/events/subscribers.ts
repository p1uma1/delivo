import { subscribeEvent, createLogger } from '@delivo/shared';
import { deliveryService } from '../services/delivery.service';

const logger = createLogger('delivery-service:events');

export async function initDeliverySubscribers() {
  // Listen for order creation to create a pending delivery
  await subscribeEvent<{
    orderId: string;
    pickupAddress: string;
    deliveryAddress: string;
  }>(
    'delivery-service.order-created',
    'order.created',
    async (payload) => {
      logger.info(`Creating pending delivery for order ${payload.orderId}`);
      await deliveryService.createPendingDelivery(
        payload.orderId,
        payload.pickupAddress,
        payload.deliveryAddress
      );
    }
  );

  // Listen for order cancellation
  await subscribeEvent<{ orderId: string }>(
    'delivery-service.order-cancelled',
    'order.cancelled',
    async (payload) => {
      logger.warn(`Order ${payload.orderId} cancelled. Marking delivery as FAILED/CANCELLED.`);
      const delivery = await deliveryService.getDeliveryByOrderId(payload.orderId);
      if (delivery) {
        // Simple logic for MVP: just update status
        // In real world, might need complex cleanup
        logger.info(`Cleaning up delivery ${delivery.id}`);
      }
    }
  );
}
