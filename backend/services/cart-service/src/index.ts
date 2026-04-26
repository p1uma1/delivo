import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createLogger, globalErrorHandler } from '@delivo/shared';
import cartRoutes from './routes/cart.routes';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const logger = createLogger('cart-service');
const app = express();
const PORT = process.env.CART_SERVICE_PORT || 3005;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cart-service', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/cart', cartRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Initialization ───────────────────────────────────────────────────────────
async function start() {
  try {
    app.listen(PORT, () => {
      logger.info(`Cart Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start Cart Service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
