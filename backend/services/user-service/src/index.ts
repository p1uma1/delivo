import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalErrorHandler, NotFoundError, connectRabbitMQ } from '@delivo/shared';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split('||') : '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Initialization ───────────────────────────────────────────────────────────
async function start() {
  try {
    if (process.env.NODE_ENV !== 'test') {
      // Connect to RabbitMQ before accepting connections
      await connectRabbitMQ();
      app.listen(PORT, () => {
        console.log(`User Service running on port ${PORT}`);
      });
    }
  } catch (err) {
    console.error('Failed to start User Service', err);
    process.exit(1);
  }
}

start();

export default app;
