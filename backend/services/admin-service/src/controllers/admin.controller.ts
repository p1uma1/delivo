import { Request, Response, NextFunction } from 'express';
import { adminRepository } from '../repositories/admin.repository';
import { ForbiddenError } from '@delivo/shared';

// Helper to ensure only admins can access
const ensureAdmin = (req: Request) => {
  if (req.user?.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }
};

export class AdminController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      ensureAdmin(req);
      const stats = await adminRepository.getPlatformStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      ensureAdmin(req);
      const users = await adminRepository.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      ensureAdmin(req);
      const { id } = req.params;
      const { isActive } = req.body;
      await adminRepository.updateUserStatus(id, isActive);
      res.json({ success: true, message: 'User status updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      ensureAdmin(req);
      const orders = await adminRepository.getAllOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      ensureAdmin(req);
      const products = await adminRepository.getAllProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async toggleProductStatus(req: Request, res: Response, next: NextFunction) {
    try {
      ensureAdmin(req);
      const { id } = req.params;
      const { isActive } = req.body;
      await adminRepository.updateProductStatus(id, isActive);
      res.json({ success: true, message: 'Product status updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
