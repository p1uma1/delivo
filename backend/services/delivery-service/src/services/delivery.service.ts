import { deliveryRepository, DeliveryStatus } from '../repositories/delivery.repository';
import { publishEvent, NotFoundError, ValidationError } from '@delivo/shared';
import { v4 as uuidv4 } from 'uuid';

export class DeliveryService {
  async createPendingDelivery(orderId: string, pickupAddress: string, deliveryAddress: string) {
    const trackingNumber = `DLV-${uuidv4().split('-')[0].toUpperCase()}`;

    const delivery = await deliveryRepository.create({
      orderId,
      pickupAddress,
      deliveryAddress,
      trackingNumber,
      status: 'PENDING',
    });

    return delivery;
  }

  async assignRider(deliveryId: string, riderId: string) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new NotFoundError('Delivery not found');

    if (delivery.status !== 'PENDING') {
      throw new ValidationError(`Delivery is already in ${delivery.status} status`);
    }

    const updatedDelivery = await deliveryRepository.update(deliveryId, {
      riderId,
      status: 'ASSIGNED',
    });

    const customerEmail = await deliveryRepository.getCustomerEmailByDeliveryId(deliveryId);

    await publishEvent('delivery.assigned', {
      deliveryId: updatedDelivery.id,
      orderId: updatedDelivery.orderId,
      riderId: updatedDelivery.riderId,
      customerEmail,
    });

    return updatedDelivery;
  }

  async updateDeliveryStatus(deliveryId: string, status: DeliveryStatus, riderId: string) {
    const delivery = await deliveryRepository.findById(deliveryId);
    if (!delivery) throw new NotFoundError('Delivery not found');

    if (delivery.riderId !== riderId) {
      throw new ValidationError('You are not assigned to this delivery');
    }

    const updatedDelivery = await deliveryRepository.updateStatus(deliveryId, status);
    const customerEmail = await deliveryRepository.getCustomerEmailByDeliveryId(deliveryId);

    await publishEvent('delivery.status.updated', {
      deliveryId: updatedDelivery.id,
      orderId: updatedDelivery.orderId,
      status: updatedDelivery.status,
      customerEmail,
    });

    if (status === 'DELIVERED') {
      await publishEvent('delivery.completed', {
        deliveryId: updatedDelivery.id,
        orderId: updatedDelivery.orderId,
      });
    }

    return updatedDelivery;
  }

  async getDeliveryByOrderId(orderId: string) {
    return deliveryRepository.findByOrderId(orderId);
  }

  async getRiderAssignments(riderId: string) {
    return deliveryRepository.findByRiderId(riderId);
  }

  async updateRiderLocation(riderId: string, latitude: number, longitude: number) {
    return deliveryRepository.upsertRiderLocation(riderId, latitude, longitude);
  }
}

export const deliveryService = new DeliveryService();
