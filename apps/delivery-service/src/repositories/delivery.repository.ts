import { Delivery, RiderLocation, Prisma, DeliveryStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export class DeliveryRepository {
  async findById(id: string): Promise<Delivery | null> {
    return prisma.delivery.findUnique({ where: { id } });
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    return prisma.delivery.findUnique({ where: { orderId } });
  }

  async findByRiderId(riderId: string): Promise<Delivery[]> {
    return prisma.delivery.findMany({
      where: { riderId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(data: Prisma.DeliveryCreateInput): Promise<Delivery> {
    return prisma.delivery.create({ data });
  }

  async update(id: string, data: Prisma.DeliveryUpdateInput): Promise<Delivery> {
    return prisma.delivery.update({ where: { id }, data });
  }

  async updateStatus(id: string, status: DeliveryStatus): Promise<Delivery> {
    return prisma.delivery.update({ where: { id }, data: { status } });
  }

  async upsertRiderLocation(riderId: string, latitude: Float, longitude: Float): Promise<RiderLocation> {
    return prisma.riderLocation.upsert({
      where: { riderId },
      update: { latitude, longitude, updatedAt: new Date() },
      create: { riderId, latitude, longitude },
    });
  }

  async findRiderLocation(riderId: string): Promise<RiderLocation | null> {
    return prisma.riderLocation.findUnique({ where: { riderId } });
  }
}

export const deliveryRepository = new DeliveryRepository();
