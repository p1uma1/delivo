import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalErrorHandler, NotFoundError } from '@delivo/shared';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
  });
}

export default app;
