import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class SentryService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private sentry;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    captureException(error: Error, context?: Record<string, any>): void;
    captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
    setUser(id: string, email?: string): void;
    clearUser(): void;
}
