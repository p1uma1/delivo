import dotenv from 'dotenv';
import path from 'path';

// Load .env relative to this file
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { globalErrorHandler, NotFoundError } from '@delivo/shared';
import adminRoutes from './routes/admin.routes';

const app = express();
const PORT = process.env.ADMIN_SERVICE_PORT || 3006;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split('||') : '*', credentials: true }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'admin-service', timestamp: new Date().toISOString() });
});

app.use('/', adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, _res, next) => {
  next(new NotFoundError('Route not found'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Admin Service running on port ${PORT}`);
  });
}

export default app;
