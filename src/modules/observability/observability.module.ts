import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppLoggerService } from './logger.service';
import { SentryService } from './sentry.service';
import { CorrelationMiddleware } from './correlation.middleware';
import { PerformanceInterceptor } from './performance.interceptor';
import { SlowQuerySubscriber } from './slow-query.subscriber';

@Module({
  providers: [
    AppLoggerService,
    SentryService,
    SlowQuerySubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
  exports: [AppLoggerService, SentryService],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}