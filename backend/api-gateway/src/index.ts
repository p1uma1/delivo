import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createLogger, globalErrorHandler, authenticateToken, NotFoundError } from '@delivo/shared';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter';

const app = express();
const logger = createLogger('api-gateway');
const PORT = process.env.PORT || 3000;

// ─── Service URLs ──────────────────────────────────────────────────────────────
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:3003';

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(globalRateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// ─── Proxy Configuration Helper ───────────────────────────────────────────────
const proxyOptions = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, _req, res) => {
        logger.error('Proxy error', { target, error: (err as Error).message });
        (res as Response).status(502).json({
          success: false,
          error: { message: 'Service temporarily unavailable', statusCode: 502 },
        });
      },
    },
  });

// ─── Public Routes (no JWT needed) ───────────────────────────────────────────
app.use(
  '/api/auth',
  authRateLimiter,
  proxyOptions(USER_SERVICE_URL)
);

// ─── Protected Routes (JWT required at gateway level) ─────────────────────────
app.use(
  '/api/users',
  authenticateToken,
  proxyOptions(USER_SERVICE_URL)
);

app.use(
  '/api/orders',
  authenticateToken,
  proxyOptions(ORDER_SERVICE_URL)
);

app.use(
  '/api/deliveries',
  authenticateToken,
  proxyOptions(DELIVERY_SERVICE_URL)
);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route not found'));
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Proxying: /api/auth, /api/users → ${USER_SERVICE_URL}`);
  logger.info(`Proxying: /api/orders → ${ORDER_SERVICE_URL}`);
  logger.info(`Proxying: /api/deliveries → ${DELIVERY_SERVICE_URL}`);
});

export default app;
