import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { ValidationError } from '@delivo/shared';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { pickupAddress, deliveryAddress, items } = req.body;
      const customerId = req.user!.userId;

      if (!pickupAddress || !deliveryAddress || !items) {
        throw new ValidationError('pickupAddress, deliveryAddress, and items are required');
      }

      const order = await orderService.createOrder({
        customerId,
        pickupAddress,
        deliveryAddress,
        items,
      });

      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrder(req.params.id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getCustomerOrders(req.user!.userId);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id;
      const userId = req.user!.userId;
      const order = await orderService.cancelOrder(orderId, userId);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
