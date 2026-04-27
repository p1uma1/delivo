import amqplib, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { createLogger } from '../logger';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

const logger = createLogger('rabbitmq-client');

interface RabbitMQClient {
  connection: Connection;
  channel: Channel;
}

let client: RabbitMQClient | null = null;

const EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'delivo.events';
const RECONNECT_DELAY = 5000;

// ─── Connection ───────────────────────────────────────────────────────────────

export async function connectRabbitMQ(retries = 10): Promise<RabbitMQClient> {
  const url = process.env.RABBITMQ_URL;
  if (!url) throw new Error('RABBITMQ_URL not set');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Connecting to RabbitMQ (attempt ${attempt}/${retries})...`);
      const connection = await amqplib.connect(url) as any;
      const channel = await connection.createChannel();

      // Declare the main topic exchange
      await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

      connection.on('error', (err: { message: any; }) => {
        logger.error('RabbitMQ connection error', { error: err.message });
        client = null;
        setTimeout(() => connectRabbitMQ(), RECONNECT_DELAY);
      });

      connection.on('close', () => {
        logger.warn('RabbitMQ connection closed, reconnecting...');
        client = null;
        setTimeout(() => connectRabbitMQ(), RECONNECT_DELAY);
      });

      const newClient = { connection, channel };
      client = newClient;
      logger.info('RabbitMQ connected successfully');
      return newClient;
    } catch (err) {
      logger.warn(`RabbitMQ connection failed, retrying in ${RECONNECT_DELAY / 1000}s...`, {
        attempt,
        error: (err as Error).message,
      });
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, RECONNECT_DELAY));
    }
  }

  throw new Error('Failed to connect to RabbitMQ after all retries');
}

function getClient(): RabbitMQClient {
  if (!client) throw new Error('RabbitMQ not connected. Call connectRabbitMQ() first.');
  return client;
}

// ─── Publisher ────────────────────────────────────────────────────────────────

export async function publishEvent<T>(routingKey: string, payload: T): Promise<void> {
  const { channel } = getClient();
  const message = Buffer.from(JSON.stringify(payload));

  channel.publish(EXCHANGE, routingKey, message, {
    persistent: true,
    contentType: 'application/json',
    timestamp: Date.now(),
  });

  logger.debug(`Event published: ${routingKey}`, { payload });
}

// ─── Consumer ─────────────────────────────────────────────────────────────────

export async function subscribeEvent<T>(
  queueName: string,
  routingKey: string,
  handler: (payload: T, msg: ConsumeMessage) => Promise<void>
): Promise<void> {
  const { channel } = getClient();

  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, EXCHANGE, routingKey);

  // Process one message at a time per consumer
  channel.prefetch(1);

  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    try {
      const payload: T = JSON.parse(msg.content.toString());
      logger.debug(`Event received: ${routingKey}`, { queue: queueName, payload });
      await handler(payload, msg);
      channel.ack(msg);
    } catch (err) {
      logger.error(`Error processing message from ${queueName}`, {
        error: (err as Error).message,
      });
      // Re-queue once, then discard (dead-letter handling)
      channel.nack(msg, false, !msg.fields.redelivered);
    }
  });

  logger.info(`Subscribed to queue: ${queueName} [${routingKey}]`);
}
