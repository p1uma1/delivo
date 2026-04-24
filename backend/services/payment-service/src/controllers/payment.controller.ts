import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { AppError } from '@delivo/shared';

export class PaymentController {
  async makePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, amount, paymentMethod } = req.body;

      if (!orderId || !amount) {
        throw new AppError('orderId and amount are required', 400);
      }

      const payment = await paymentService.processPayment(orderId, amount, paymentMethod || 'card');
      
      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.params;
      
      if (!paymentId) {
        throw new AppError('paymentId is required', 400);
      }

      const payment = await paymentService.verifyPayment(paymentId);
      
      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
