import { Order, OrderItem, Prisma, OrderStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export class OrderRepository {
  async findById(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.OrderCreateInput): Promise<Order & { items: OrderItem[] }> {
    return prisma.order.create({
      data,
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}

export const orderRepository = new OrderRepository();
