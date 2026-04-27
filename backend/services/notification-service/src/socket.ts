import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { createLogger } from '@delivo/shared';

const logger = createLogger('notification-service:socket');

let io: Server;
const userSockets = new Map<string, string[]>();

export function initSocketServer(port: number) {
  const httpServer = createServer();
  io = new Server(httpServer, {
    cors: {
      origin: '*', // In production, restrict this
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    
    if (userId) {
      logger.info(`User ${userId} connected via socket ${socket.id}`);
      
      const sockets = userSockets.get(userId) || [];
      sockets.push(socket.id);
      userSockets.set(userId, sockets);

      socket.on('disconnect', () => {
        logger.info(`User ${userId} disconnected`);
        const sockets = userSockets.get(userId) || [];
        const filtered = sockets.filter(id => id !== socket.id);
        if (filtered.length > 0) {
          userSockets.set(userId, filtered);
        } else {
          userSockets.delete(userId);
        }
      });
    } else {
      logger.warn(`Socket connected without userId: ${socket.id}`);
      socket.disconnect();
    }
  });

  httpServer.listen(port, () => {
    logger.info(`Socket.io server listening on port ${port}`);
  });

  return io;
}

export function sendNotificationToUser(userId: string, event: string, data: any) {
  if (!io) {
    logger.error('Socket server not initialized');
    return;
  }

  const sockets = userSockets.get(userId);
  if (sockets && sockets.length > 0) {
    logger.info(`Sending ${event} to user ${userId}`);
    sockets.forEach(socketId => {
      io.to(socketId).emit(event, data);
    });
  } else {
    logger.debug(`User ${userId} not connected via socket, skipping real-time notification`);
  }
}

export function broadcastNotification(event: string, data: any) {
  if (!io) {
    logger.error('Socket server not initialized');
    return;
  }

  logger.info(`Broadcasting ${event} to all connected users`);
  io.emit(event, data);
}
