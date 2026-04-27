import { deliveryRepository } from '../repositories/delivery.repository';
import type { DeliveryStatus } from '../repositories/delivery.repository';
import { offerRepository } from '../repositories/offer.repository';
import { publishEvent, NotFoundError, ValidationError } from '@delivo/shared';

function createTrackingNumber() {
  return `DLV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export class DeliveryService {
  async createPendingDelivery(orderId: string, pickupAddress: string, deliveryAddress: string) {
    const trackingNumber = createTrackingNumber();

    const delivery = await deliveryRepository.create({
      orderId,
      pickupAddress,
      deliveryAddress,
      trackingNumber,
      status: 'PENDING',
    });

    return delivery;
  }

  async submitDeliveryOffer(orderId: string, riderId: string, deliveryFee: number, estimatedMinutes?: number) {
    // Check if rider already submitted an offer for this order
    const existingOffer = await offerRepository.findOfferByOrderAndRider(orderId, riderId);
    if (existingOffer) {
      throw new ValidationError('You have already submitted an offer for this order');
    }

    const offer = await offerRepository.create({
      orderId,
      riderId,
      deliveryFee,
      estimatedMinutes,
    });

    // Publish event for offer submission
    await publishEvent('delivery.offer.submitted', {
      offerId: offer.id,
      orderId: offer.orderId,
      riderId: offer.riderId,
      deliveryFee: offer.deliveryFee,
      estimatedMinutes: offer.estimatedMinutes,
    });

    return offer;
  }

  async getOrderOffers(orderId: string) {
    return offerRepository.findByOrderId(orderId);
  }

  async getAvailableOrders(riderId: string) {
    // This would fetch orders that are waiting for rider offers
    // For now, returning empty - the frontend will call this endpoint
    // In a real system, you might query orders with status = 'WAITING_FOR_OFFERS'
    return [];
  }

  async getRiderOffers(riderId: string) {
    return offerRepository.findByRiderId(riderId);
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

    await publishEvent('delivery.assigned', {
      deliveryId: updatedDelivery.id,
      orderId: updatedDelivery.orderId,
      riderId: updatedDelivery.riderId,
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

    await publishEvent('delivery.status.updated', {
      deliveryId: updatedDelivery.id,
      orderId: updatedDelivery.orderId,
      status: updatedDelivery.status,
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
