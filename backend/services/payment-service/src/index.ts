import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createLogger, globalErrorHandler, connectRabbitMQ } from '@delivo/shared';
import paymentRoutes from './routes/payment.routes';

const logger = createLogger('payment-service');
const app = express();
const PORT = process.env.PORT || 3004;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'payment-service', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/payments', paymentRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Initialization ───────────────────────────────────────────────────────────
async function start() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    app.listen(PORT, () => {
      logger.info(`Payment Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start Payment Service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
