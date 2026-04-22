import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { ValidationError } from '@delivo/shared';

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await userService.getProfile(userId);
      res.json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { name, phone } = req.body;

      if (!name && !phone) {
        throw new ValidationError('At least one field (name, phone) must be provided');
      }

      const user = await userService.updateProfile(userId, { name, phone });
      res.json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  }

  async listRiders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const riders = await userService.listRiders();
      res.json({ success: true, data: { riders, count: riders.length } });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
