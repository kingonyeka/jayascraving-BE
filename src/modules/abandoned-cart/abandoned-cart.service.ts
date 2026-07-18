import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, DataSource } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { QUEUE_ABANDONED_CART, JOB_CART_SEND_RECOVERY, JOB_CART_CLEANUP } from '../queues/jobs/queue.constants';

// cart is considered abandoned after 2 hours of inactivity
const ABANDONED_AFTER_HOURS = 2;

// send recovery email 1 hour after cart is considered abandoned
const RECOVERY_EMAIL_DELAY_HOURS = 1;

@Injectable()
export class AbandonedCartService {
  private readonly logger = new Logger(AbandonedCartService.name);

  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    @InjectQueue(QUEUE_ABANDONED_CART) private readonly cartQueue: Queue,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Schedule recovery email when item is added to cart ───────────────────
  // Called from CartService.addItem() after saving the cart item.
  // If the user doesn't checkout within 2+1=3 hours, the recovery email fires.

  async scheduleRecovery(cartId: string, userId: string): Promise<void> {
    const delayMs =
      (ABANDONED_AFTER_HOURS + RECOVERY_EMAIL_DELAY_HOURS) * 60 * 60 * 1000;

    // jobId prevents duplicate jobs for the same cart
    const jobId = `cart-recovery:${cartId}`;

    // remove existing job first (user may have added more items)
    const existing = await this.cartQueue.getJob(jobId);
    if (existing) await existing.remove();

    await this.cartQueue.add(
      JOB_CART_SEND_RECOVERY,
      { cartId, userId },
      { delay: delayMs, jobId, attempts: 2 },
    );

    this.logger.debug(`Recovery email scheduled for cart ${cartId} in ${ABANDONED_AFTER_HOURS + RECOVERY_EMAIL_DELAY_HOURS}h`);
  }

  // ─── Cancel recovery when user checks out ─────────────────────────────────
  // Called from OrdersService.createFromCart() after order is saved.

  async cancelRecovery(cartId: string): Promise<void> {
    const job = await this.cartQueue.getJob(`cart-recovery:${cartId}`);
    if (job) {
      await job.remove();
      this.logger.debug(`Recovery email cancelled for cart ${cartId} — user checked out`);
    }
  }

  // ─── Process recovery email (called by AbandonedCartProcessor) ────────────
  // Previously, AbandonedCartProcessor had its own separate, dumber
  // implementation of this handler (just a log line + a TODO), so this
  // method — the one that actually built and sent an email — was never
  // reachable. The processor now delegates to this method directly.

  async processRecoveryEmail(cartId: string, userId: string): Promise<void> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ['items'],
    });

    if (!cart || !cart.items?.length) {
      this.logger.log(`Cart ${cartId} is empty — skipping recovery email`);
      return;
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;

    const cartTotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity, 0,
    );

    const itemSummary = cart.items
      .slice(0, 3) // show max 3 items in email
      .map((i) => `${i.productName} x${i.quantity}`)
      .join(', ');

    this.logger.log(
      `Sending abandoned cart recovery email to ${user.email} — ${cart.items.length} items (${itemSummary}), NGN ${cartTotal.toLocaleString()}`,
    );

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3001');

    // Uses a dedicated abandoned-cart-recovery template — previously this
    // reused the order-confirmation template with a fake order number
    // ("YOUR CART"), which was explicitly left as a placeholder.
    await this.notificationsService.sendAbandonedCartRecovery(user.email, {
      customerName: user.fullName,
      itemSummary,
      itemCount: cart.items.length,
      cartTotal,
      checkoutUrl: `${frontendUrl}/cart`,
    });
  }

  // ─── Find all abandoned carts ──────────────────────────────────────────────
  // Used by admin analytics and cron job

  async findAbandonedCarts(): Promise<Cart[]> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - ABANDONED_AFTER_HOURS);

    return this.cartRepo
      .createQueryBuilder('cart')
      .innerJoinAndSelect('cart.items', 'items')
      .where('cart.userId IS NOT NULL')        // only logged-in user carts
      .andWhere('cart.updatedAt < :cutoff', { cutoff })
      .getMany();
  }

  // ─── Get abandoned cart count ──────────────────────────────────────────────

  async getAbandonedCartCount(): Promise<number> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - ABANDONED_AFTER_HOURS);

    return this.cartRepo
      .createQueryBuilder('cart')
      .innerJoin('cart.items', 'items')
      .where('cart.userId IS NOT NULL')
      .andWhere('cart.updatedAt < :cutoff', { cutoff })
      .getCount();
  }

  // ─── Clean up expired guest carts ─────────────────────────────────────────
  // Run this on a schedule (daily via Bull cron — see scheduleDailyCleanup)

  async cleanupExpiredGuestCarts(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30); // delete guest carts older than 30 days

    const oldCarts = await this.cartRepo.find({
      where: {
        userId: IsNull(),
        updatedAt: LessThan(cutoff),
      },
      relations: ['items'],
    });

    if (!oldCarts.length) return 0;

    // Release any stock these guest carts were still holding reserved
    // before deleting them. Previously this just called cartRepo.remove()
    // directly, which permanently leaked the reserved stockCount for every
    // item in every expired guest cart — those units could never be sold
    // again even though nobody actually bought them.
    await this.dataSource.transaction(async (manager) => {
      for (const cart of oldCarts) {
        for (const item of cart.items ?? []) {
          const product = await manager.findOne(Product, { where: { id: item.productId } });
          if (product && product.stockCount >= 0) {
            await manager.increment(Product, { id: item.productId }, 'stockCount', item.quantity);
          }
        }
      }
      await manager.remove(Cart, oldCarts);
    });

    this.logger.log(`Cleaned up ${oldCarts.length} expired guest carts and released their reserved stock`);
    return oldCarts.length;
  }

  // ─── Schedule daily cleanup as a recurring Bull job ───────────────────────
  // Invoked once at application bootstrap — see AbandonedCartModule.onModuleInit.

  async scheduleDailyCleanup(): Promise<void> {
    // runs every day at 2am — using Bull repeat
    await this.cartQueue.add(
      JOB_CART_CLEANUP,
      {},
      {
        repeat: { cron: '0 2 * * *' }, // 2:00 AM every day
        jobId: 'daily-cart-cleanup',
      },
    );
    this.logger.log('Daily cart cleanup job scheduled');
  }
}
