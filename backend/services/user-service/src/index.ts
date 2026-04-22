import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createLogger, globalErrorHandler, connectRabbitMQ } from '@delivo/shared';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const logger = createLogger('user-service');
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Initialization ───────────────────────────────────────────────────────────
async function start() {
  try {
    // Connect to RabbitMQ
    await connectRabbitMQ();

    app.listen(PORT, () => {
      logger.info(`User Service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start User Service', { error: (err as Error).message });
    process.exit(1);
  }
}

start();

export default app;
