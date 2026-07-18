import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  private readonly redis: Redis;

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly configService: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    this.redis = new Redis(this.configService.get<string>('REDIS_URL'));
  }

  // GET /api/health — full health check (DB + Redis + memory)
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // PostgreSQL
      () => this.db.pingCheck('database'),

      // Redis
      () => this.checkRedis(),

      // Memory — alert if heap exceeds 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // RSS — alert if process exceeds 512MB
      () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
    ]);
  }

  // GET /api/health/live — liveness probe (is the process running?)
  // Used by Docker HEALTHCHECK and Render to know if container is alive
  @Get('live')
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: this.configService.get<string>('NODE_ENV'),
    };
  }

  // GET /api/health/ready — readiness probe (is the app ready to serve traffic?)
  // Checks DB only — used during startup to delay traffic until DB is connected
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  // ─── Redis health check ────────────────────────────────────────────────────

  private async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redis.ping();
      if (result === 'PONG') {
        return { redis: { status: 'up' } };
      }
      throw new Error('Unexpected Redis response');
    } catch (error: any) {
      return {
        redis: {
          status: 'down',
          message: error?.message,
        },
      };
    }
  }
}