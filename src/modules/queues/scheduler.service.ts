import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QueuesService } from './queues.service';
import { AbandonedCartService } from '../abandoned-cart/abandoned-cart.service';

/**
 * Previously, several "scheduled" features were fully implemented but had
 * no trigger at all:
 *  - QueuesService.runLowStockCheck() had zero callers anywhere.
 *  - AbandonedCartService.scheduleDailyCleanup() (which registers a Bull
 *    repeatable job) also had zero callers anywhere.
 *  - There was no @nestjs/schedule ScheduleModule / @Cron usage anywhere in
 *    the codebase at all, so nothing ever ran on a recurring basis.
 *
 * This service is the missing trigger layer.
 */
@Injectable()
export class SchedulerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly queuesService: QueuesService,
    private readonly abandonedCartService: AbandonedCartService,
  ) {}

  async onApplicationBootstrap() {
    // Registers the daily cart-cleanup job with Bull's own repeat/cron
    // scheduler. Only needs to run once — Bull persists the repeatable job
    // definition in Redis, so this is safe to call on every app restart
    // (jobId dedupes it).
    await this.abandonedCartService.scheduleDailyCleanup();
    this.logger.log('Scheduler bootstrap complete — daily cart cleanup registered');
  }

  // Runs every 6 hours — checks all products for low stock and emails admins
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleLowStockCheck() {
    this.logger.debug('Triggering scheduled low-stock check');
    await this.queuesService.runLowStockCheck();
  }
}
