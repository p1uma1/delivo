import { PrismaClient } from '@prisma/client';
import { createLogger } from '@delivo/shared';

const logger = createLogger('delivery-service:prisma');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    logger.debug('Query executed', { query: e.query, duration: `${e.duration}ms` });
  });
}

prisma.$on('error' as never, (e: { message: string }) => {
  logger.error('Prisma error', { message: e.message });
});

export default prisma;
