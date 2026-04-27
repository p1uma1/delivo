import { Router } from 'express';
import { deliveryController } from '../controllers/delivery.controller';
import { authenticateToken, authorizeRole } from '@delivo/shared';

const router = Router();

// Apply auth middleware to all delivery routes
router.use(authenticateToken);

// ─── Delivery Offer Routes ────────────────────────────────────────────────────
// POST /deliveries/offers - Riders submit delivery offers
router.post('/offers', authorizeRole('rider'), (req, res, next) =>
  deliveryController.submitOffer(req, res, next)
);

// GET /deliveries/offers/:orderId - Get all offers for an order
router.get('/offers/:orderId', (req, res, next) =>
  deliveryController.getOrderOffers(req, res, next)
);

// GET /deliveries/rider/available-orders - Riders get available orders to bid on
router.get('/rider/available-orders', authorizeRole('rider'), (req, res, next) =>
  deliveryController.getAvailableOrders(req, res, next)
);

// GET /deliveries/rider/my-offers - Riders get their submitted offers
router.get('/rider/my-offers', authorizeRole('rider'), (req, res, next) =>
  deliveryController.getMyOffers(req, res, next)
);

// ─── Delivery Management Routes ───────────────────────────────────────────────
// POST /deliveries/assign - Admin only
router.post('/assign', authorizeRole('admin'), (req, res, next) =>
  deliveryController.assignRider(req, res, next)
);

// PATCH /deliveries/:id/status - Riders only
router.patch('/:id/status', authorizeRole('rider'), (req, res, next) =>
  deliveryController.updateStatus(req, res, next)
);

// GET /deliveries/track/:orderId - Any authenticated user
router.get('/track/:orderId', (req, res, next) =>
  deliveryController.trackDelivery(req, res, next)
);

// GET /deliveries/rider/assignments - Riders only
router.get('/rider/assignments', authorizeRole('rider'), (req, res, next) =>
  deliveryController.getMyAssignments(req, res, next)
);

// POST /deliveries/location - Riders only
router.post('/location', authorizeRole('rider'), (req, res, next) =>
  deliveryController.updateLocation(req, res, next)
);

export default router;
