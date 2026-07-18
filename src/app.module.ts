import { Module } from '@nestjs/common';
import { AppResolver } from './app.resolver';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import * as Joi from 'joi';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import jwtConfig from './config/jwt.config';
import awsConfig from './config/aws.config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { CustomOrdersModule } from './modules/custom-orders/custom-orders.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MediaModule } from './modules/media/media.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { StaffModule } from './modules/staff/staff.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HealthModule } from './modules/health/health.module';
import { GqlThrottlerGuard } from './common/guards/throttle.guard';
import { DepthLimitRule } from './common/guards/gql-depth.guard';
import { createComplexityPlugin, MAX_COMPLEXITY } from './common/guards/gql-complexity.guard';
import { SlowQuerySubscriber } from './modules/observability/slow-query.subscriber';
import { ObservabilityModule } from './modules/observability/observability.module';
import { AppCacheModule } from './modules/cache/cache.module';
import { QueuesModule } from './modules/queues/queues.module';
import { DataloaderModule } from './modules/dataloader/dataloader.module';
import { ProductLoader } from './modules/dataloader/product.loader';
import { UserLoader } from './modules/dataloader/user.loader';
import { OrderLoader } from './modules/dataloader/order.loader';
import { Product } from './modules/products/entities/product.entity';
import { Category } from './modules/products/entities/category.entity';
import { ProductMedia } from './modules/products/entities/product-media.entity';
import { ProductVariant } from './modules/products/entities/product-variant.entity';
import { User } from './modules/users/entities/user.entity';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';
import { InAppNotificationsModule } from './modules/in-app-notifications/in-app-notifications.module';
import { RealTimeAnalyticsModule } from './modules/real-time-analytics/real-time-analytics.module';
import { AbandonedCartModule } from './modules/abandoned-cart/abandoned-cart.module';






@Module({
  imports: [
    // Enables @Cron() decorators app-wide — previously there was no
    // ScheduleModule registration anywhere, so no recurring job (low-stock
    // check, daily cart cleanup, etc.) could ever run automatically.
    ScheduleModule.forRoot(),

    // ─── Config ─────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, redisConfig, jwtConfig, awsConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        REDIS_QUEUE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        S3_BUCKET: Joi.string().required(),
        CLOUDFRONT_URL: Joi.string().required(),
        PAYSTACK_SECRET_KEY: Joi.string().required(),
        PAYSTACK_WEBHOOK_SECRET: Joi.string().required(),
        RESEND_API_KEY: Joi.string().required(),
        EMAIL_FROM: Joi.string().email().required(),
        FRONTEND_URL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        INTERNAL_API_KEY: Joi.string().required(),
        FIREBASE_PROJECT_ID: Joi.string().optional(),
        FIREBASE_CLIENT_EMAIL: Joi.string().optional(),
        FIREBASE_PRIVATE_KEY: Joi.string().optional(),
        TRUST_PROXY_HOPS: Joi.number().default(1),
        DB_SSL_REJECT_UNAUTHORIZED: Joi.string().valid('true', 'false').default('true'),
        ADMIN_ALERT_EMAIL: Joi.string().email().optional(),
      }),
    }),

    // ─── Throttler (rate limiting) ───────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [
          { name: 'default', ttl: 60000, limit: 60 },
          { name: 'auth', ttl: 60000, limit: 10 },
          { name: 'upload', ttl: 60000, limit: 20 },
        ],
      }),
    }),

    // ─── Database ────────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') === 'development',
        migrationsRun: config.get<string>('NODE_ENV') === 'production',
        migrations: [join(__dirname, '..', 'migrations', '*.js')],
        // Previously { rejectUnauthorized: false } in production, which
        // disables TLS certificate validation entirely — the connection was
        // encrypted but not authenticated, i.e. vulnerable to MITM. Managed
        // Postgres providers (Neon, RDS, etc.) present certificates trusted
        // by the system CA bundle, so validation can stay on by default.
        ssl: config.get<string>('NODE_ENV') === 'production'
          ? { rejectUnauthorized: config.get<string>('DB_SSL_REJECT_UNAUTHORIZED') !== 'false' }
          : false,
        logging: config.get<string>('NODE_ENV') === 'development',
        subscribers: [SlowQuerySubscriber],
      }),
    }),

    // ─── GraphQL ─────────────────────────────────────────────────────────────
    // DataLoaders must be created fresh for every request so their internal
    // caches never leak across users/requests.
    //
    // Previously, ProductLoader/UserLoader/OrderLoader (all Scope.REQUEST)
    // were injected directly into this forRootAsync's `inject` array. That
    // factory only runs once, at application bootstrap — not per request —
    // so despite being marked REQUEST scope, every request ended up sharing
    // the exact same loader instances (and their `{ cache: true }` caches)
    // forever. That's both a stale-data bug (one user's batched results
    // could be served to another) and an unbounded memory leak.
    //
    // Fix: inject the underlying (singleton) TypeORM repositories instead,
    // and construct brand new loader instances inside the `context` factory,
    // which genuinely does run once per GraphQL request.
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataloaderModule],
      inject: [
        ConfigService,
        getRepositoryToken(Product),
        getRepositoryToken(Category),
        getRepositoryToken(ProductMedia),
        getRepositoryToken(ProductVariant),
        getRepositoryToken(User),
        getRepositoryToken(Order),
        getRepositoryToken(OrderItem),
      ],
      useFactory: (
        config: ConfigService,
        productRepo: Repository<Product>,
        categoryRepo: Repository<Category>,
        mediaRepo: Repository<ProductMedia>,
        variantRepo: Repository<ProductVariant>,
        userRepo: Repository<User>,
        orderRepo: Repository<Order>,
        orderItemRepo: Repository<OrderItem>,
      ) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        // Schema introspection lets anyone enumerate every type/field/
        // mutation, including admin-only ones — fine for dev, a recon aid
        // for attackers in production.
        introspection: config.get<string>('NODE_ENV') !== 'production',
        context: ({ req, res }: { req: any; res: any }) => ({
          req,
          res,
          loaders: {
            product: new ProductLoader(productRepo, categoryRepo, mediaRepo, variantRepo),
            user: new UserLoader(userRepo),
            order: new OrderLoader(orderRepo, orderItemRepo),
          },
        }),
        validationRules: [DepthLimitRule],
        plugins: [createComplexityPlugin(MAX_COMPLEXITY)],
        buildSchemaOptions: {
          dateScalarMode: 'timestamp',
        },
      }) as unknown as ApolloDriverConfig,
    }),

    // ─── Redis + Bull queues (uses dedicated queue Redis instance) ────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.get<string>('REDIS_QUEUE_URL')!);
        return {
          redis: {
            host: url.hostname,
            port: Number(url.port),
            password: url.password,
            tls: url.protocol === 'rediss:' ? {} : undefined,
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: false,
          },
        };
      },
    }),

    // ─── Cache (Redis — uses cache Redis instance) ────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: 'ioredis',
        url: config.get<string>('REDIS_URL'),
        ttl: 300,
      }),
    }),

    // ─── Health ───────────────────────────────────────────────────────────────
    TerminusModule,

    // ─── Feature modules ──────────────────────────────────────────────────────
    ObservabilityModule,
    AppCacheModule,
    DataloaderModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    DeliveryModule,
    CustomOrdersModule,
    PromotionsModule,
    NotificationsModule,
    MediaModule,
    ReviewsModule,
    AnalyticsModule,
    StaffModule,
    SettingsModule,
    HealthModule,
    QueuesModule,
    PushNotificationsModule,
    InAppNotificationsModule,
    RealTimeAnalyticsModule,
    AbandonedCartModule
  ],
  providers: [
    AppResolver,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}