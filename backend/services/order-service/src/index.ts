import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createLogger, globalErrorHandler, connectRabbitMQ } from '@delivo/shared';
import orderRoutes from './routes/order.routes';
import { initOrderSubscribers } from './events/subscribers';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });


const logger = createLogger('order-service');
const app = express();
const PORT = process.env.ORDER_SERVICE_PORT || 3002;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/orders', orderRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Initialization ───────────────────────────────────────────────────────────
async function start() {
  try {
    let rabbitConnected = false;

    try {
      await connectRabbitMQ();
      rabbitConnected = true;
      console.log("✅ RabbitMQ connected");
    } catch (error) {
      console.log("⚠ RabbitMQ unavailable - skipped for local development");
    }

    // Only initialize subscribers if RabbitMQ works
    if (rabbitConnected) {
      await initOrderSubscribers();
      console.log("✅ Subscribers initialized");
    } else {
      console.log("⚠ Subscribers skipped");
    }

    app.listen(PORT, () => {
      logger.info(`Order Service running on port ${PORT}`);
    });

  } catch (err) {
    logger.error('Failed to start Order Service', {
      error: (err as Error).message
    });
    process.exit(1);
  }
}

start();

export default app;
