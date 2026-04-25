import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateToken } from '@delivo/shared';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticateToken);

router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));

// Users
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.patch('/users/:id/status', (req, res, next) => adminController.toggleUserStatus(req, res, next));

// Orders
router.get('/orders', (req, res, next) => adminController.getOrders(req, res, next));

// Products
router.get('/products', (req, res, next) => adminController.getProducts(req, res, next));
router.patch('/products/:id/status', (req, res, next) => adminController.toggleProductStatus(req, res, next));

export default router;
