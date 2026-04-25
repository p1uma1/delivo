import { Request, Response, NextFunction } from 'express';
import { productRepository } from '../repositories/product.repository';
import { NotFoundError, ForbiddenError, ValidationError } from '@delivo/shared';

export class ProductController {
  
  // ─── Public Endpoints ────────────────────────────────────────────────────────

  async browseProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query;
      const products = await productRepository.findAll({
        category: category as string,
        search: search as string,
      });
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productRepository.findById(id);
      if (!product) throw new NotFoundError('Product not found');
      
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  // ─── Merchant Endpoints ──────────────────────────────────────────────────────

  async getMerchantProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId || req.user?.role !== 'merchant') {
        throw new ForbiddenError('Only merchants can access this');
      }

      const products = await productRepository.findByMerchantId(merchantId);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      if (!merchantId || req.user?.role !== 'merchant') {
        throw new ForbiddenError('Only merchants can create products');
      }

      const { name, description, price, category, imageUrl, stock, isActive } = req.body;
      if (!name || !price || !category) {
        throw new ValidationError('Missing required product fields');
      }

      const product = await productRepository.create({
        merchantId,
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || '',
        stock: stock ? parseInt(stock, 10) : 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      const { id } = req.params;
      if (!merchantId || req.user?.role !== 'merchant') {
        throw new ForbiddenError('Only merchants can update products');
      }

      const product = await productRepository.update(id, merchantId, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const merchantId = req.user?.userId;
      const { id } = req.params;
      if (!merchantId || req.user?.role !== 'merchant') {
        throw new ForbiddenError('Only merchants can delete products');
      }

      await productRepository.delete(id, merchantId);
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
