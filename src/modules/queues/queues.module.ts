import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { QueuesService } from './queues.service';
import { QueuesResolver } from './queues.resolver';
import { SchedulerService } from './scheduler.service';
import { OrderProcessor } from './processors/order.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { InventoryProcessor } from './processors/inventory.processor';
import { AbandonedCartProcessor } from './processors/abandoned-cart.processor';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Product } from '../products/entities/product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { AbandonedCartModule } from '../abandoned-cart/abandoned-cart.module';
import { PaymentsModule } from '../payments/payments.module';
import { queueDefaults } from './jobs/queue-defaults';
import {
  QUEUE_ORDER,
  QUEUE_PAYMENT,
  QUEUE_INVENTORY,
} from './jobs/queue.constants';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Order, Payment, Product, Cart, User]),
    BullModule.registerQueue(
      { name: QUEUE_ORDER, ...queueDefaults },
      { name: QUEUE_PAYMENT, ...queueDefaults },
      { name: QUEUE_INVENTORY, ...queueDefaults },
    ),
    NotificationsModule,
    // AbandonedCartModule is the single owner of the QUEUE_ABANDONED_CART
    // Bull registration (see abandoned-cart.module.ts) — previously this
    // module *also* independently registered a queue with that same name,
    // which worked but was redundant and, worse, wasn't the registration
    // that AbandonedCartService's jobs actually flowed through, so its
    // retry/backoff defaults were silently not applied to real jobs.
    AbandonedCartModule,
    // forwardRef: see payments.module.ts — PaymentProcessor needs
    // PaymentsService, and PaymentsModule needs QueuesService, so these two
    // modules depend on each other.
    forwardRef(() => PaymentsModule),
  ],
  providers: [
    QueuesService,
    QueuesResolver,
    SchedulerService,
    OrderProcessor,
    PaymentProcessor,
    InventoryProcessor,
    AbandonedCartProcessor,
  ],
  exports: [QueuesService],
})
export class QueuesModule {}