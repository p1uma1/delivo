import { Router } from 'express';
import { authController } from '../controllers/auth.controller';

const router = Router();

// POST /auth/register
router.post('/register', (req, res, next) => authController.register(req, res, next));

// POST /auth/login
router.post('/login', (req, res, next) => authController.login(req, res, next));

// POST /auth/refresh
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

// POST /auth/logout
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

export default router;
