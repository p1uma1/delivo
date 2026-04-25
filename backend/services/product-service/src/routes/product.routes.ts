import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticateToken } from '@delivo/shared';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
// Anybody can browse products
router.get('/', (req, res, next) => productController.browseProducts(req, res, next));
router.get('/:id', (req, res, next) => productController.getProduct(req, res, next));

// ─── Protected Merchant Routes ────────────────────────────────────────────────
// Apply auth middleware to all merchant routes
router.use('/merchant', authenticateToken);

router.get('/merchant/my-products', (req, res, next) => productController.getMerchantProducts(req, res, next));
router.post('/merchant/products', (req, res, next) => productController.createProduct(req, res, next));
router.patch('/merchant/products/:id', (req, res, next) => productController.updateProduct(req, res, next));
router.delete('/merchant/products/:id', (req, res, next) => productController.deleteProduct(req, res, next));

export default router;
