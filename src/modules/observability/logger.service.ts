import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { AsyncLocalStorage } from 'async_hooks';

// ─── Async local storage for correlation ID propagation ────────────────────
export const correlationStorage = new AsyncLocalStorage<{ requestId: string; userId?: string }>();

// ─── Winston formats ────────────────────────────────────────────────────────
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const store = correlationStorage.getStore();
    const log: Record<string, any> = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      requestId: store?.requestId ?? 'system',
      userId: store?.userId ?? null,
      context: info.context ?? null,
      ...(info.stack ? { stack: info.stack } : {}),
      ...(info.meta ? { meta: info.meta } : {}),
    };
    return JSON.stringify(log);
  }),
);

const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const store = correlationStorage.getStore();
    const reqId = store?.requestId ? `[${store.requestId.slice(0, 8)}]` : '';
    const ctx = info.context ? `[${info.context}]` : '';
    return `${info.timestamp} ${info.level} ${reqId}${ctx} ${info.message}`;
  }),
);

@Injectable({ scope: Scope.DEFAULT })
export class AppLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  private readonly isDev: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isDev = configService.get<string>('NODE_ENV') !== 'production';

    this.logger = winston.createLogger({
      level: this.isDev ? 'debug' : 'info',
      format: this.isDev ? prettyFormat : jsonFormat,
      transports: [
        new winston.transports.Console(),
        // daily rotating log file in production
        ...(!this.isDev
          ? [
              new DailyRotateFile({
                filename: 'logs/app-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d',
                maxSize: '20m',
                format: jsonFormat,
              }),
              new DailyRotateFile({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                level: 'error',
                maxFiles: '30d',
                maxSize: '20m',
                format: jsonFormat,
              }),
            ]
          : []),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, stack: trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // ─── Structured log with metadata ────────────────────────────────────────

  info(message: string, meta?: Record<string, any>, context?: string) {
    this.logger.info(message, { context, meta });
  }
}