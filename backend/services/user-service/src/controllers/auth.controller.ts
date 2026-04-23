import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { googleAuthService } from '../services/google-auth.service';
import { ValidationError } from '@delivo/shared';

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name, phone, role } = req.body;
      if (!email || !password || !name) {
        throw new ValidationError('email, password, and name are required');
      }

      const { accessToken, refreshToken, user } = await authService.register({
        email,
        password,
        name,
        phone,
        role,
      });

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
      res.status(201).json({ success: true, data: { accessToken, user } });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ValidationError('email and password are required');
      }

      const { accessToken, refreshToken, user } = await authService.login({ email, password });

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user } });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
      if (!token) {
        throw new ValidationError('Refresh token is required');
      }

      const { accessToken, refreshToken, user } = await authService.refreshTokens(token);

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user } });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie(REFRESH_COOKIE);
      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (err) {
      next(err);
    }
  }

  // POST /auth/google
  async loginWithGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken, role } = req.body;
      if (!idToken) {
        throw new ValidationError('Google idToken is required');
      }

      const { accessToken, refreshToken, user } = await googleAuthService.loginWithGoogle({
        idToken,
        role,
      });

      res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS);
      res.json({ success: true, data: { accessToken, user } });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
