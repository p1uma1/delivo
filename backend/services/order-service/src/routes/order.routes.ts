import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticateToken } from '@delivo/shared';

const router = Router();

// Apply auth middleware to all order routes
router.use(authenticateToken);

// GET /orders/stats - customer statistics
router.get('/stats', (req, res, next) => orderController.getCustomerStats(req, res, next));

// GET /orders - list my orders
router.get('/', (req, res, next) => orderController.getMyOrders(req, res, next));

// POST /orders - create order
router.post('/', (req, res, next) => orderController.createOrder(req, res, next));

// GET /orders/:id - get order details
router.get('/:id', (req, res, next) => orderController.getOrder(req, res, next));

// PATCH /orders/:id/cancel - cancel order
router.patch('/:id/cancel', (req, res, next) => orderController.cancelOrder(req, res, next));

// GET /orders/:id/offers - get rider offers for an order
router.get('/:id/offers', (req, res, next) => orderController.getOrderOffers(req, res, next));

// POST /orders/:id/select-offer - select a rider offer
router.post('/:id/select-offer', (req, res, next) => orderController.selectOffer(req, res, next));

router.get('/pending', authenticateToken, (req, res) =>
  orderController.pending(req, res)
);

router.post('/bid', authenticateToken, (req, res) =>
  orderController.bid(req, res)
);

router.get('/:id/bids', authenticateToken, (req, res) =>
  orderController.bids(req, res)
);

router.post('/select-rider', authenticateToken, (req, res) =>
  orderController.select(req, res)
);

export default router;
