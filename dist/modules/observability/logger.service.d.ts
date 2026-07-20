import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';
export declare const correlationStorage: AsyncLocalStorage<{
    requestId: string;
    userId?: string;
}>;
export declare class AppLoggerService implements LoggerService {
    private readonly configService;
    private readonly logger;
    private readonly isDev;
    constructor(configService: ConfigService);
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    info(message: string, meta?: Record<string, any>, context?: string): void;
}
