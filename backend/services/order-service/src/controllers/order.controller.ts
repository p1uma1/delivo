import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { ValidationError } from '@delivo/shared';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        merchantId, 
        merchantName, 
        items, 
        dropAddress, 
        deliveryAddress, 
        pickupAddress, 
        notes 
      } = req.body;
      const customerId = req.user!.userId;

      // Map frontend 'dropAddress' to 'deliveryAddress' if needed
      const finalDeliveryAddress = deliveryAddress || dropAddress;

      if (!items || items.length === 0) {
        throw new ValidationError('Items are required');
      }

      const order = await orderService.createOrder({
        customerId,
        merchantId,
        merchantName,
        pickupAddress,
        deliveryAddress: finalDeliveryAddress,
        notes,
        items: items.map((i: any) => ({
          productId: i.productId,
          name: i.productName || i.name,
          quantity: i.quantity,
          price: i.unitPrice || i.price,
        })),
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

  async getCustomerStats(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getCustomerOrders(req.user!.userId);
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, o) => sum + o.itemTotal, 0);
      
      // Find most frequent merchant
      const merchantCounts: Record<string, number> = {};
      orders.forEach(o => {
        if (o.merchantName) {
          merchantCounts[o.merchantName] = (merchantCounts[o.merchantName] || 0) + 1;
        }
      });
      
      let favoriteMerchant = 'N/A';
      let maxCount = 0;
      for (const [name, count] of Object.entries(merchantCounts)) {
        if (count > maxCount) {
          maxCount = count;
          favoriteMerchant = name;
        }
      }

      res.json({
        success: true,
        data: {
          totalOrders,
          totalSpent: totalSpent.toFixed(2),
          favoriteMerchant
        }
      });
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

  async getPendingOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getPendingOrders();
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async getOrderOffers(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id;
      
      // Fetch actual offers from delivery-service
      try {
        const deliveryServiceUrl = process.env.DELIVERY_SERVICE__URL || 'http://localhost:3003';
        const offersResponse = await fetch(`${deliveryServiceUrl}/deliveries/offers/${orderId}`, {
          headers: { 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` }
        });
        
        if (offersResponse.ok) {
          const data:any = await offersResponse.json();
          return res.json({ success: true, data: data.data || [] });
        }
      } catch (err) {
        console.error('Failed to fetch offers from delivery-service:', err);
      }

      // Fallback: return empty array if service unavailable
      res.json({ success: true, data: [] });
    } catch (err) {
      next(err);
    }
  }

  async selectOffer(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id;
      const { offerId } = req.body;
      const userId = req.user!.userId;

      if (!offerId) {
        throw new ValidationError('offerId is required');
      }

      // 1. Get the order to verify ownership
      const order = await orderService.getOrder(orderId);
      if (order.customerId !== userId) {
        throw new ValidationError('You can only select offers for your own orders');
      }

      // 2. Update order status to RIDER_SELECTED (simulating the rider_selected step from context.md)
      // In a real system, this would trigger an event to delivery-service to create the delivery
      // and update the offers.
      const updatedOrder = await orderService.updateOrderStatus(orderId, 'rider_selected');
      
      res.json({ success: true, data: updatedOrder });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
