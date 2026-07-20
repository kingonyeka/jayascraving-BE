import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
export declare class HealthController {
    private readonly health;
    private readonly db;
    private readonly memory;
    private readonly configService;
    private readonly dataSource;
    private readonly redis;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, configService: ConfigService, dataSource: DataSource);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult<HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & HealthIndicatorResult<"memory_rss"> & HealthIndicatorResult<"memory_heap"> & HealthIndicatorResult & HealthIndicatorResult<"database">, Partial<HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & HealthIndicatorResult<"memory_rss"> & HealthIndicatorResult<"memory_heap"> & HealthIndicatorResult & HealthIndicatorResult<"database">>, Partial<HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & HealthIndicatorResult<"memory_rss"> & HealthIndicatorResult<"memory_heap"> & HealthIndicatorResult & HealthIndicatorResult<"database">>>>;
    liveness(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
    };
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult<HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & HealthIndicatorResult<"database">, Partial<HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & HealthIndicatorResult<"database">>, Partial<HealthIndicatorResult<string, import("@nestjs/terminus").HealthIndicatorStatus, Record<string, any>> & HealthIndicatorResult<"database">>>>;
    private checkRedis;
}
