import winston from 'winston';

const { combine, timestamp, json, colorize, printf } = winston.format;

const devFormat = printf(({ level, message, service, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
});

export function createLogger(serviceName: string): winston.Logger {
  const isProduction = process.env.NODE_ENV === 'production';

  return winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: isProduction
          ? combine(timestamp(), json())
          : combine(
              colorize(),
              timestamp({ format: 'HH:mm:ss' }),
              devFormat
            ),
      }),
    ],
  });
}
