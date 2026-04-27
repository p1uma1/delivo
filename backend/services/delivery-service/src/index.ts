import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createLogger, globalErrorHandler, connectRabbitMQ } from '@delivo/shared';
import deliveryRoutes from './routes/delivery.routes';
import { initDeliverySubscribers } from './events/subscribers';

const logger = createLogger('delivery-service');
const app = express();
const PORT = process.env.DELIVERY_SERVICE_PORT || 3007;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'delivery-service', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/deliveries', deliveryRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Initialization ───────────────────────────────────────────────────────────
async function start() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    // Initialize event subscribers
    await initDeliverySubscribers();

    app.listen(PORT, () => {
      logger.info(`Delivery Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start Delivery Service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
