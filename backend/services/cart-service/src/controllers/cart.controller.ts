import { Request, Response, NextFunction } from 'express';
import { cartRepository } from '../repositories/cart.repository';

export class CartController {
  getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is set by the API gateway's authenticateToken middleware
      const customerId = (req as any).user?.userId;
      if (!customerId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      }

      const cart = await cartRepository.getCart(customerId);
      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      next(error);
    }
  };

  addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      }

      const item = req.body;
      const updatedItem = await cartRepository.addItem(customerId, item);
      res.status(201).json({ success: true, data: updatedItem });
    } catch (error) {
      next(error);
    }
  };

  updateItemQuantity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      await cartRepository.updateItemQuantity(customerId, productId, quantity);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      }

      const { productId } = req.params;
      await cartRepository.removeItem(customerId, productId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      }

      await cartRepository.clearCart(customerId);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  };
}

export const cartController = new CartController();
