import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticateToken, authorizeRole } from '@delivo/shared';

const router = Router();

// GET /users/me — any authenticated user
router.get('/me', authenticateToken, (req, res, next) =>
  userController.getProfile(req, res, next)
);

// PATCH /users/me — any authenticated user
router.patch('/me', authenticateToken, (req, res, next) =>
  userController.updateProfile(req, res, next)
);

// GET /users/riders — admin only
router.get('/riders', authenticateToken, authorizeRole('admin'), (req, res, next) =>
  userController.listRiders(req, res, next)
);

export default router;
