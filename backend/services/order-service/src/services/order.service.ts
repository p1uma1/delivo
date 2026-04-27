import { orderRepository, OrderStatus } from '../repositories/order.repository';
import { publishEvent, NotFoundError, ValidationError } from '@delivo/shared';

interface CreateOrderInput {
  customerId: string;
  merchantId: string;
  merchantName?: string;
  pickupAddress?: string;
  deliveryAddress: string;
  items: {
    productId?: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  notes?: string;
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const { customerId, merchantId, merchantName, pickupAddress, deliveryAddress, notes, items } = input;

    if (!items || items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    const itemTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Reserve stock synchronously before creating order
    try {
      const productServiceUrl = process.env.PRODUCT_SERVICE_INTERNAL_URL || 'http://localhost:3004';
      const reserveResponse = await fetch(`${productServiceUrl}/products/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(item => ({ productId: item.productId, quantity: item.quantity })) })
      });

      if (!reserveResponse.ok) {
        const errorData = await reserveResponse.json() as any;
        throw new ValidationError(`Stock reservation failed: ${errorData.error || reserveResponse.statusText}`);
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      throw new Error(`Failed to contact product service for stock reservation: ${(err as Error).message}`);
    }

    const order = await orderRepository.create({
      customerId,
      merchantId,
      merchantName,
      pickupAddress: pickupAddress || 'Store Pickup', // Default if not provided
      deliveryAddress,
      itemTotal,
      notes,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    // Publish event
    await publishEvent('order.created', {
      orderId: order.id,
      customerId: order.customerId,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.itemTotal,
      items: order.items,
    });

    return order;
  }

  async getOrder(orderId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  async getCustomerOrders(customerId: string) {
    return orderRepository.findByCustomerId(customerId);
  }

  async getPendingOrders() {
    // Fetch orders that are in PENDING status (waiting for rider offers)
    return orderRepository.findByStatus('pending');
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (order.customerId !== userId) {
      throw new ValidationError('You can only cancel your own orders');
    }

    if (order.status !== 'pending') {
      throw new ValidationError(`Cannot cancel order in ${order.status} status`);
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, 'cancelled');

    await publishEvent('order.cancelled', {
      orderId: order.id,
      customerId: order.customerId,
    });

    return updatedOrder;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    return orderRepository.updateStatus(orderId, status);
  }
}

export const orderService = new OrderService();
