import { Request, Response, NextFunction } from 'express';
import { deliveryService } from '../services/delivery.service';
import { ValidationError } from '@delivo/shared';

export class DeliveryController {
  async submitOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, deliveryFee, estimatedMinutes } = req.body;
      const riderId = req.user!.userId;

      if (!orderId || deliveryFee === undefined) {
        throw new ValidationError('orderId and deliveryFee are required');
      }

      if (typeof deliveryFee !== 'number' || deliveryFee <= 0) {
        throw new ValidationError('deliveryFee must be a positive number');
      }

      const offer = await deliveryService.submitDeliveryOffer(
        orderId,
        riderId,
        deliveryFee,
        estimatedMinutes
      );

      res.status(201).json({ success: true, data: offer });
    } catch (err) {
      next(err);
    }
  }

  async getOrderOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId;
      const offers = await deliveryService.getOrderOffers(orderId);
      res.json({ success: true, data: offers });
    } catch (err) {
      next(err);
    }
  }

  async getAvailableOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const riderId = req.user!.userId;
      const orders = await deliveryService.getAvailableOrders(riderId);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async getMyOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const riderId = req.user!.userId;
      const offers = await deliveryService.getRiderOffers(riderId);
      res.json({ success: true, data: offers });
    } catch (err) {
      next(err);
    }
  }

  async assignRider(req: Request, res: Response, next: NextFunction) {
    try {
      const { deliveryId, riderId } = req.body;
      if (!deliveryId || !riderId) {
        throw new ValidationError('deliveryId and riderId are required');
      }

      const delivery = await deliveryService.assignRider(deliveryId, riderId);
      res.json({ success: true, data: delivery });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const deliveryId = req.params.id;
      const riderId = req.user!.userId;

      if (!status) {
        throw new ValidationError('status is required');
      }

      const delivery = await deliveryService.updateDeliveryStatus(deliveryId, status, riderId);
      res.json({ success: true, data: delivery });
    } catch (err) {
      next(err);
    }
  }

  async trackDelivery(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId;
      const delivery = await deliveryService.getDeliveryByOrderId(orderId);
      res.json({ success: true, data: delivery });
    } catch (err) {
      next(err);
    }
  }

  async getMyAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const riderId = req.user!.userId;
      const deliveries = await deliveryService.getRiderAssignments(riderId);
      res.json({ success: true, data: deliveries });
    } catch (err) {
      next(err);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { latitude, longitude } = req.body;
      const riderId = req.user!.userId;

      if (latitude === undefined || longitude === undefined) {
        throw new ValidationError('latitude and longitude are required');
      }

      await deliveryService.updateRiderLocation(riderId, latitude, longitude);
      res.json({ success: true, message: 'Location updated' });
    } catch (err) {
      next(err);
    }
  }
}

export const deliveryController = new DeliveryController();
