import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { createLogger, globalErrorHandler, authenticateToken, NotFoundError } from '@delivo/shared';
import { globalRateLimiter, authRateLimiter } from './middleware/rateLimiter';
import dotenv from 'dotenv';
import path from 'node:path';

const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });

const app = express();
const logger = createLogger('api-gateway');

if (result.error) {
  logger.warn(`Could not load .env from ${envPath}. Falling back to system environment variables.`);
} else {
  logger.info(`Loaded .env from ${envPath}`);
}

const PORT = process.env.PORT || 3000;

console.log('USER_SERVICE_URL:', process.env.USER_SERVICE_URL);

// ─── Service URLs ──────────────────────────────────────────────────────────────
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://delivery-service:3003';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:5002';

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split('||') : '*', credentials: true }));
app.use(express.json());
app.use(globalRateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// ─── Proxy Configuration Helper ───────────────────────────────────────────────
const proxyOptions = (target: string, basePath: string) =>
  createProxyMiddleware<Request, Response>({
    target,
    changeOrigin: true,
    pathRewrite: (_path, req) => `${basePath}${req.url}`,
    on: {
      proxyReq: (proxyReq, req, _res) => {
        fixRequestBody(proxyReq, req);

        logger.info('Proxy request', {
          method: req.method,
          originalUrl: req.originalUrl,
          incomingUrl: req.url,
          basePath,
          target,
          forwardedPath: proxyReq.path,
          finalUrl: `${target}${proxyReq.path}`,
          headers: {
            'content-type': req.headers['content-type'],
            authorization: req.headers.authorization
              ? `${req.headers.authorization.slice(0, 20)}...`
              : undefined,
          },
        });
      },

      proxyRes: (proxyRes, req) => {
        logger.info('Proxy response', {
          method: req.method,
          originalUrl: req.originalUrl,
          statusCode: proxyRes.statusCode,
          target,
        });
      },

      error: (err, req, res) => {
        logger.error('Proxy error', {
          method: req.method,
          originalUrl: req ? req.originalUrl : 'unknown',
          incomingUrl: req ? req.url : 'unknown',
          basePath,
          target,
          attemptedUrl: req ? `${target}${basePath}${req.url}` : target,
          error: err instanceof Error ? err.message : 'unknown error',
        });

        if (res) {
          (res as Response).status(502).json({
            success: false,
            error: { message: 'Service temporarily unavailable', statusCode: 502 },
          });
        }
      },
    },
  });

// ─── Public Routes (no JWT needed) ───────────────────────────────────────────
app.use(
  '/api/auth',
  authRateLimiter,
  proxyOptions(USER_SERVICE_URL, '/auth')
);

// ─── Protected Routes (JWT required at gateway level) ─────────────────────────
app.use(
  '/api/users',
  authenticateToken,
  proxyOptions(USER_SERVICE_URL, '/users')
);

app.use(
  '/api/products',
  authenticateToken,
  proxyOptions(PRODUCT_SERVICE_URL, '/products')
);

app.use(
  '/api/orders',
  authenticateToken,
  proxyOptions(ORDER_SERVICE_URL, '/orders')     //change according to path provided by backend
);

app.use(
  '/api/deliveries',
  authenticateToken,
  proxyOptions(DELIVERY_SERVICE_URL, '/deliveries')  //change according to path provided by backend
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
  logger.info(`Proxying: /api/products → ${PRODUCT_SERVICE_URL}`);
});

export default app;
