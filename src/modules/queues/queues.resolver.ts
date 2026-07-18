import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueueStatsResult } from './dto/queue-stats.type';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

/**
 * Previously QueuesService.getQueueStats() was fully implemented — job
 * counts (waiting/active/completed/failed/delayed) for every queue — but
 * had zero callers anywhere, so there was no way to actually check queue
 * health/depth without a raw Redis client or a separate tool like Bull
 * Board. This exposes it as a simple admin query.
 */
@Resolver()
export class QueuesResolver {
  constructor(private readonly queuesService: QueuesService) {}

  @Query(() => QueueStatsResult, { description: 'Admin: job counts for every Bull queue (order, payment, inventory, cart)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  queueStats(): Promise<QueueStatsResult> {
    return this.queuesService.getQueueStats();
  }
}
