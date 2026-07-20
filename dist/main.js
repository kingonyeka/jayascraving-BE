"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const suspicious_login_interceptor_1 = require("./common/interceptors/suspicious-login.interceptor");
const logger_service_1 = require("./modules/observability/logger.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
        rawBody: true,
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3001');
    const isDev = configService.get('NODE_ENV') !== 'production';
    const logger = app.get(logger_service_1.AppLoggerService);
    app.useLogger(logger);
    app.set('trust proxy', configService.get('TRUST_PROXY_HOPS', 1));
    app.use((0, helmet_1.default)({ contentSecurityPolicy: isDev ? false : undefined }));
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-request-id'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new suspicious_login_interceptor_1.SuspiciousLoginInterceptor());
    app.setGlobalPrefix('api');
    app.enableShutdownHooks();
    await app.listen(port);
    logger.log(`🚀 Server running on http://localhost:${port}/api`, 'Bootstrap');
    logger.log(`📊 GraphQL playground: http://localhost:${port}/graphql`, 'Bootstrap');
    logger.log(`❤️  Health check: http://localhost:${port}/api/health`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map