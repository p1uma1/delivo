import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticateToken } from '@delivo/shared';

const router = Router();

// Apply auth middleware to all cart routes
router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:productId', cartController.updateItemQuantity);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
