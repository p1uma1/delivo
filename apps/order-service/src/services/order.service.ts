import { orderRepository } from '../repositories/order.repository';
import { publishEvent, NotFoundError, ValidationError } from '@delivo/shared';
import { OrderStatus } from '@prisma/client';

interface CreateOrderInput {
  customerId: string;
  pickupAddress: string;
  deliveryAddress: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export class OrderService {
  async createOrder(input: CreateOrderInput) {
    const { customerId, pickupAddress, deliveryAddress, items } = input;

    if (!items || items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await orderRepository.create({
      customerId,
      pickupAddress,
      deliveryAddress,
      totalAmount,
      items: {
        create: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });

    // Publish event
    await publishEvent('order.created', {
      orderId: order.id,
      customerId: order.customerId,
      pickupAddress: order.pickupAddress,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
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

  async cancelOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new NotFoundError('Order not found');

    if (order.customerId !== userId) {
      throw new ValidationError('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new ValidationError(`Cannot cancel order in ${order.status} status`);
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, OrderStatus.CANCELLED);

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
