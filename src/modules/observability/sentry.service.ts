import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);
  private sentry: any;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const env = this.configService.get<string>('NODE_ENV');

    if (!dsn) {
      this.logger.warn('SENTRY_DSN not set — error tracking disabled');
      return;
    }

    // dynamic import so app still boots without Sentry if DSN is missing
    try {
      const Sentry = await import('@sentry/nestjs');
      Sentry.init({
        dsn,
        environment: env,
        tracesSampleRate: env === 'production' ? 0.2 : 1.0, // 20% in prod, 100% in dev
        profilesSampleRate: env === 'production' ? 0.1 : 1.0,
        integrations: [],
        beforeSend(event) {
          // scrub sensitive data before sending to Sentry
          if (event.request?.cookies) {
            delete event.request.cookies;
          }
          if (event.request?.headers?.authorization) {
            event.request.headers.authorization = '[REDACTED]';
          }
          if (event.request?.headers?.['x-api-key']) {
            event.request.headers['x-api-key'] = '[REDACTED]';
          }
          return event;
        },
      });

      this.sentry = Sentry;
      this.logger.log(`Sentry initialised for environment: ${env}`);
    } catch (error: any) {
      this.logger.error(`Failed to initialise Sentry: ${error?.message}`);
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.sentry) return;
    this.sentry.withScope((scope: any) => {
      if (context) scope.setExtras(context);
      this.sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.sentry) return;
    this.sentry.captureMessage(message, level);
  }

  setUser(id: string, email?: string) {
    if (!this.sentry) return;
    this.sentry.setUser({ id, email });
  }

  clearUser() {
    if (!this.sentry) return;
    this.sentry.setUser(null);
  }
}