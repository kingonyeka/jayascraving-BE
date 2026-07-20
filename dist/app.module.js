"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_resolver_1 = require("./app.resolver");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const typeorm_2 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const cache_manager_1 = require("@nestjs/cache-manager");
const terminus_1 = require("@nestjs/terminus");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const Joi = __importStar(require("joi"));
const database_config_1 = __importDefault(require("./config/database.config"));
const redis_config_1 = __importDefault(require("./config/redis.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const aws_config_1 = __importDefault(require("./config/aws.config"));
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./modules/auth/auth.module");
const products_module_1 = require("./modules/products/products.module");
const cart_module_1 = require("./modules/cart/cart.module");
const orders_module_1 = require("./modules/orders/orders.module");
const payments_module_1 = require("./modules/payments/payments.module");
const delivery_module_1 = require("./modules/delivery/delivery.module");
const custom_orders_module_1 = require("./modules/custom-orders/custom-orders.module");
const promotions_module_1 = require("./modules/promotions/promotions.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const media_module_1 = require("./modules/media/media.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const staff_module_1 = require("./modules/staff/staff.module");
const settings_module_1 = require("./modules/settings/settings.module");
const health_module_1 = require("./modules/health/health.module");
const throttle_guard_1 = require("./common/guards/throttle.guard");
const gql_depth_guard_1 = require("./common/guards/gql-depth.guard");
const gql_complexity_guard_1 = require("./common/guards/gql-complexity.guard");
const slow_query_subscriber_1 = require("./modules/observability/slow-query.subscriber");
const observability_module_1 = require("./modules/observability/observability.module");
const cache_module_1 = require("./modules/cache/cache.module");
const queues_module_1 = require("./modules/queues/queues.module");
const dataloader_module_1 = require("./modules/dataloader/dataloader.module");
const product_loader_1 = require("./modules/dataloader/product.loader");
const user_loader_1 = require("./modules/dataloader/user.loader");
const order_loader_1 = require("./modules/dataloader/order.loader");
const product_entity_1 = require("./modules/products/entities/product.entity");
const category_entity_1 = require("./modules/products/entities/category.entity");
const product_media_entity_1 = require("./modules/products/entities/product-media.entity");
const product_variant_entity_1 = require("./modules/products/entities/product-variant.entity");
const user_entity_1 = require("./modules/users/entities/user.entity");
const order_entity_1 = require("./modules/orders/entities/order.entity");
const order_item_entity_1 = require("./modules/orders/entities/order-item.entity");
const push_notifications_module_1 = require("./modules/push-notifications/push-notifications.module");
const in_app_notifications_module_1 = require("./modules/in-app-notifications/in-app-notifications.module");
const real_time_analytics_module_1 = require("./modules/real-time-analytics/real-time-analytics.module");
const abandoned_cart_module_1 = require("./modules/abandoned-cart/abandoned-cart.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                load: [database_config_1.default, redis_config_1.default, jwt_config_1.default, aws_config_1.default],
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
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: () => ({
                    throttlers: [
                        { name: 'default', ttl: 60000, limit: 60 },
                        { name: 'auth', ttl: 60000, limit: 10 },
                        { name: 'upload', ttl: 60000, limit: 20 },
                    ],
                }),
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL'),
                    autoLoadEntities: true,
                    synchronize: config.get('NODE_ENV') === 'development',
                    migrationsRun: config.get('NODE_ENV') === 'production',
                    migrations: [(0, path_1.join)(__dirname, '..', 'migrations', '*.js')],
                    ssl: config.get('NODE_ENV') === 'production'
                        ? { rejectUnauthorized: config.get('DB_SSL_REJECT_UNAUTHORIZED') !== 'false' }
                        : false,
                    logging: config.get('NODE_ENV') === 'development',
                    subscribers: [slow_query_subscriber_1.SlowQuerySubscriber],
                }),
            }),
            graphql_1.GraphQLModule.forRootAsync({
                driver: apollo_1.ApolloDriver,
                imports: [dataloader_module_1.DataloaderModule],
                inject: [
                    config_1.ConfigService,
                    (0, typeorm_2.getRepositoryToken)(product_entity_1.Product),
                    (0, typeorm_2.getRepositoryToken)(category_entity_1.Category),
                    (0, typeorm_2.getRepositoryToken)(product_media_entity_1.ProductMedia),
                    (0, typeorm_2.getRepositoryToken)(product_variant_entity_1.ProductVariant),
                    (0, typeorm_2.getRepositoryToken)(user_entity_1.User),
                    (0, typeorm_2.getRepositoryToken)(order_entity_1.Order),
                    (0, typeorm_2.getRepositoryToken)(order_item_entity_1.OrderItem),
                ],
                useFactory: (config, productRepo, categoryRepo, mediaRepo, variantRepo, userRepo, orderRepo, orderItemRepo) => ({
                    autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                    sortSchema: true,
                    introspection: config.get('NODE_ENV') !== 'production',
                    context: ({ req, res }) => ({
                        req,
                        res,
                        loaders: {
                            product: new product_loader_1.ProductLoader(productRepo, categoryRepo, mediaRepo, variantRepo),
                            user: new user_loader_1.UserLoader(userRepo),
                            order: new order_loader_1.OrderLoader(orderRepo, orderItemRepo),
                        },
                    }),
                    validationRules: [gql_depth_guard_1.DepthLimitRule],
                    plugins: [(0, gql_complexity_guard_1.createComplexityPlugin)(gql_complexity_guard_1.MAX_COMPLEXITY)],
                    buildSchemaOptions: {
                        dateScalarMode: 'timestamp',
                    },
                }),
            }),
            bull_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const url = new URL(config.get('REDIS_QUEUE_URL'));
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
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    store: 'ioredis',
                    url: config.get('REDIS_URL'),
                    ttl: 300,
                }),
            }),
            terminus_1.TerminusModule,
            observability_module_1.ObservabilityModule,
            cache_module_1.AppCacheModule,
            dataloader_module_1.DataloaderModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            cart_module_1.CartModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            delivery_module_1.DeliveryModule,
            custom_orders_module_1.CustomOrdersModule,
            promotions_module_1.PromotionsModule,
            notifications_module_1.NotificationsModule,
            media_module_1.MediaModule,
            reviews_module_1.ReviewsModule,
            analytics_module_1.AnalyticsModule,
            staff_module_1.StaffModule,
            settings_module_1.SettingsModule,
            health_module_1.HealthModule,
            queues_module_1.QueuesModule,
            push_notifications_module_1.PushNotificationsModule,
            in_app_notifications_module_1.InAppNotificationsModule,
            real_time_analytics_module_1.RealTimeAnalyticsModule,
            abandoned_cart_module_1.AbandonedCartModule
        ],
        providers: [
            app_resolver_1.AppResolver,
            {
                provide: core_1.APP_GUARD,
                useClass: throttle_guard_1.GqlThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map