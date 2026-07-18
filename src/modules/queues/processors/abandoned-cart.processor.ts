import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AbandonedCartService } from '../../abandoned-cart/abandoned-cart.service';
import {
  QUEUE_ABANDONED_CART,
  JOB_CART_SEND_RECOVERY,
  JOB_CART_CLEANUP,
} from '../jobs/queue.constants';

/**
 * Delegates to AbandonedCartService for the actual business logic.
 *
 * Previously this processor had its own separate, much simpler
 * implementation of both handlers — `handleSendRecovery` only logged a line
 * with a "wire NotificationsService.sendAbandonedCartEmail() here" TODO
 * (that method didn't even exist), and `handleCartCleanup` duplicated (with
 * a subtly different, buggy `userId: undefined` filter) the cleanup logic
 * that already existed correctly in AbandonedCartService. Since this is the
 * processor Bull actually invokes for jobs on this queue, the "real"
 * implementations in AbandonedCartService were unreachable regardless of
 * whether anything scheduled them. This file now just delegates.
 */
@Processor(QUEUE_ABANDONED_CART)
export class AbandonedCartProcessor {
  private readonly logger = new Logger(AbandonedCartProcessor.name);

  constructor(private readonly abandonedCartService: AbandonedCartService) {}

  @Process(JOB_CART_SEND_RECOVERY)
  async handleSendRecovery(job: Job<{ cartId: string; userId: string }>) {
    const { cartId, userId } = job.data;
    await this.abandonedCartService.processRecoveryEmail(cartId, userId);
  }

  @Process(JOB_CART_CLEANUP)
  async handleCartCleanup(_job: Job) {
    const cleaned = await this.abandonedCartService.cleanupExpiredGuestCarts();
    this.logger.log(`Cart cleanup job finished — ${cleaned} cart(s) removed`);
    return { cleaned };
  }
}
