import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SuspiciousLoginInterceptor } from './common/interceptors/suspicious-login.interceptor';
import { AppLoggerService } from './modules/observability/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true, // buffer logs until logger is ready
    rawBody: true, // preserves req.rawBody — required for verifying webhook HMAC signatures (Paystack etc.)
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3001');
  const isDev = configService.get<string>('NODE_ENV') !== 'production';

  // ─── Use structured JSON logger ───────────────────────────────────────────
  const logger = app.get(AppLoggerService);
  app.useLogger(logger);

  // ─── Trust reverse proxy (load balancer / nginx / Fly / Render / etc.) ─────
  // Required so req.ip and the throttler's IP-based rate limiting reflect the
  // real client IP instead of trusting an arbitrary client-supplied header.
  // Set to the number of proxy hops in front of this app (1 = single LB).
  app.set('trust proxy', configService.get<number>('TRUST_PROXY_HOPS', 1));

  // ─── Security headers ─────────────────────────────────────────────────────
  app.use(helmet({ contentSecurityPolicy: isDev ? false : undefined }));

  // ─── Cookie parser ────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-request-id'],
  });

  // ─── Global pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Global filter + interceptors ─────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new SuspiciousLoginInterceptor(),
  );

  // ─── Global prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Graceful shutdown ────────────────────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`📊 GraphQL playground: http://localhost:${port}/graphql`, 'Bootstrap');
  logger.log(`❤️  Health check: http://localhost:${port}/api/health`, 'Bootstrap');
}

bootstrap();