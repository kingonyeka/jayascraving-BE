import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  QUEUE_ORDER,
  QUEUE_PAYMENT,
  QUEUE_INVENTORY,
  QUEUE_ABANDONED_CART,
  JOB_ORDER_AUTO_CANCEL,
  JOB_ORDER_DELIVERY_REMINDER,
  JOB_PAYMENT_VERIFY,
  JOB_PAYMENT_TIMEOUT,
  JOB_INVENTORY_LOW_STOCK_ALERT,
  JOB_INVENTORY_STOCK_UPDATE,
} from './jobs/queue.constants';

@Injectable()
export class QueuesService {
  private readonly logger = new Logger(QueuesService.name);

  constructor(
    @InjectQueue(QUEUE_ORDER) private readonly orderQueue: Queue,
    @InjectQueue(QUEUE_PAYMENT) private readonly paymentQueue: Queue,
    @InjectQueue(QUEUE_INVENTORY) private readonly inventoryQueue: Queue,
    @InjectQueue(QUEUE_ABANDONED_CART) private readonly cartQueue: Queue,
  ) {}

  // ─── Order jobs ────────────────────────────────────────────────────────────

  async scheduleAutoCancel(orderId: string, delayMs: number) {
    await this.orderQueue.add(
      JOB_ORDER_AUTO_CANCEL,
      { orderId },
      { delay: delayMs, jobId: `auto-cancel:${orderId}` },
    );
    this.logger.log(`Scheduled auto-cancel for order ${orderId} in ${delayMs / 60000} minutes`);
  }

  async cancelAutoCancel(orderId: string) {
    const job = await this.orderQueue.getJob(`auto-cancel:${orderId}`);
    if (job) {
      await job.remove();
      this.logger.log(`Cancelled auto-cancel job for order ${orderId}`);
    }
  }

  async scheduleDeliveryReminder(
    orderId: string,
    userEmail: string,
    delayMs: number,
  ) {
    await this.orderQueue.add(
      JOB_ORDER_DELIVERY_REMINDER,
      { orderId, userEmail },
      { delay: delayMs, jobId: `delivery-reminder:${orderId}` },
    );
  }

  // ─── Payment jobs ──────────────────────────────────────────────────────────

  async schedulePaymentVerify(reference: string, delayMs = 60000) {
    // poll Paystack after 1 minute if webhook hasn't arrived
    await this.paymentQueue.add(
      JOB_PAYMENT_VERIFY,
      { reference },
      { delay: delayMs, attempts: 3 },
    );
  }

  async schedulePaymentTimeout(paymentId: string, delayMs: number) {
    await this.paymentQueue.add(
      JOB_PAYMENT_TIMEOUT,
      { paymentId },
      { delay: delayMs, jobId: `payment-timeout:${paymentId}` },
    );
  }

  // ─── Inventory jobs ────────────────────────────────────────────────────────

  async runLowStockCheck() {
    await this.inventoryQueue.add(JOB_INVENTORY_LOW_STOCK_ALERT, {});
  }

  async scheduleStockUpdate(productId: string, quantity: number) {
    await this.inventoryQueue.add(
      JOB_INVENTORY_STOCK_UPDATE,
      { productId, quantity },
    );
  }

  // ─── Cart jobs ─────────────────────────────────────────────────────────────
  // Previously scheduleCartRecovery()/runCartCleanup() lived here too, but
  // they were never called by anything — CartService.addItem() and
  // SchedulerService both call AbandonedCartService's own
  // scheduleRecovery()/scheduleDailyCleanup() methods directly instead
  // (see cart.service.ts and scheduler.service.ts). Removed to avoid two
  // parallel, drifting implementations of the same feature.

  // ─── Queue stats (for Bull Board / admin) ──────────────────────────────────

  async getQueueStats() {
    const [orderCounts, paymentCounts, inventoryCounts, cartCounts] =
      await Promise.all([
        this.orderQueue.getJobCounts(),
        this.paymentQueue.getJobCounts(),
        this.inventoryQueue.getJobCounts(),
        this.cartQueue.getJobCounts(),
      ]);

    return {
      order: orderCounts,
      payment: paymentCounts,
      inventory: inventoryCounts,
      cart: cartCounts,
    };
  }
}