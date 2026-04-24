import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticateToken } from '@delivo/shared';

const router = Router();

// Apply authentication middleware to all payment routes
router.use(authenticateToken);

// Make Payment
router.post('/', paymentController.makePayment);

// Verify Payment
router.get('/:paymentId/verify', paymentController.verifyPayment);

export default router;
