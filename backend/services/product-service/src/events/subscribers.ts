import { subscribeEvent, createLogger } from '@delivo/shared';
import { productRepository } from '../repositories/product.repository';

const logger = createLogger('product-service:events');

export async function initProductSubscribers() {
  // Listen for order creation to decrement stock
  await subscribeEvent<{
    orderId: string;
    items: {
      productId: string;
      quantity: number;
    }[];
  }>(
    'product-service.order-created',
    'order.created',
    async (payload) => {
      logger.info(`Decrements stock for order ${payload.orderId}`);
      for (const item of payload.items) {
        try {
          await productRepository.decrementStock(item.productId, item.quantity);
          logger.info(`Decremented ${item.quantity} for product ${item.productId}`);
        } catch (error) {
          logger.error(`Error decrementing stock for product ${item.productId}: ${(error as Error).message}`);
          // In a full saga, we would emit an order.failed event to rollback the order.
          // For now, we are using basic consistency as requested.
        }
      }
    }
  );
}
