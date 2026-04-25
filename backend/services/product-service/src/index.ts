import dotenv from 'dotenv';
import path from 'path';

// Load .env relative to this file
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { globalErrorHandler, NotFoundError, connectRabbitMQ } from '@delivo/shared';
import productRoutes from './routes/product.routes';
import { initProductSubscribers } from './events/subscribers';

const app = express();
const PORT = process.env.PRODUCT_SERVICE_PORT || 3005;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split('||') : '*', credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'product-service', timestamp: new Date().toISOString() });
});

app.use('/', productRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await connectRabbitMQ();
      await initProductSubscribers();
      
      app.listen(PORT, () => {
        console.log(`Product Service running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start Product Service', error);
    process.exit(1);
  }
}

start();

export default app;
