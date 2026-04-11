import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateToken } from '@delivo/shared';

const router = Router();

// Apply auth middleware to all order routes
router.use(authenticateToken);

// GET /orders - list my orders
router.get('/', (req, res, next) => orderController.getMyOrders(req, res, next));

// POST /orders - create order
router.post('/', (req, res, next) => orderController.createOrder(req, res, next));

// GET /orders/:id - get order details
router.get('/:id', (req, res, next) => orderController.getOrder(req, res, next));

// PATCH /orders/:id/cancel - cancel order
router.patch('/:id/cancel', (req, res, next) => orderController.cancelOrder(req, res, next));

export default router;
