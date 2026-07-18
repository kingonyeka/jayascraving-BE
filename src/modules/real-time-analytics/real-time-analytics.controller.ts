import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RealTimeAnalyticsService } from './real-time-analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

// GET /api/analytics/live
// Server-Sent Events endpoint — frontend connects once and receives a stream
// of events in real time without polling
//
// How SSE works:
// 1. Frontend opens a persistent HTTP connection to this endpoint
// 2. Server keeps the connection open and pushes events as they happen
// 3. Each event is a plain text line: "data: {...}\n\n"
// 4. Frontend uses EventSource API to receive them:
//    const es = new EventSource('/api/analytics/live', { withCredentials: true })
//    es.onmessage = (e) => console.log(JSON.parse(e.data))

@Controller('analytics')
export class RealTimeAnalyticsController {
  private readonly logger = new Logger(RealTimeAnalyticsController.name);

  constructor(private readonly analyticsService: RealTimeAnalyticsService) {}

  @Get('live')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async liveStream(@Req() req: Request, @Res() res: Response) {
    // ─── SSE headers ──────────────────────────────────────────────────────────
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
    res.flushHeaders();                         // send headers immediately

    this.logger.log(`SSE client connected: ${req.ip}`);

    const safeWrite = (payload: unknown) => {
      if (res.writableEnded) return;
      try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      } catch (err: any) {
        this.logger.warn(`SSE write failed (client likely disconnected): ${err?.message}`);
      }
    };

    // ─── Send initial snapshot ─────────────────────────────────────────────
    try {
      const snapshot = await this.analyticsService.getLiveDashboardSnapshot();
      safeWrite({ type: 'SNAPSHOT', payload: snapshot });
    } catch (err: any) {
      this.logger.error(`Failed to load initial analytics snapshot: ${err?.message}`);
      safeWrite({ type: 'ERROR', message: 'Failed to load initial snapshot' });
    }

    // ─── Subscribe to live events ──────────────────────────────────────────
    const subscription = this.analyticsService
      .getEventStream()
      .subscribe({
        next: (event) => safeWrite(event),
        error: (err) => {
          this.logger.error(`SSE stream error: ${err?.message}`);
          res.end();
        },
      });

    // ─── Heartbeat every 30 seconds ────────────────────────────────────────
    // Keeps the connection alive through proxies and load balancers
    const heartbeat = setInterval(() => {
      safeWrite({ type: 'HEARTBEAT', timestamp: new Date().toISOString() });
    }, 30000);

    // ─── Clean up on disconnect ────────────────────────────────────────────
    req.on('close', () => {
      subscription.unsubscribe();
      clearInterval(heartbeat);
      this.logger.log(`SSE client disconnected: ${req.ip}`);
    });
  }
}