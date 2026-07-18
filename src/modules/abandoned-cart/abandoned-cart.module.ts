import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AbandonedCartService } from './abandoned-cart.service';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { QUEUE_ABANDONED_CART } from '../queues/jobs/queue.constants';
import { queueDefaults } from '../queues/jobs/queue-defaults';

// This is the single registration point for QUEUE_ABANDONED_CART.
// Previously QueuesModule *also* independently registered a queue with this
// same name — harmless (Bull handled it), but redundant, and that second
// registration was the one carrying retry/backoff defaults while this one
// (the one AbandonedCartService actually adds jobs through) had none.
// Exporting BullModule's registration here lets QueuesModule import this
// module (which it already does, for AbandonedCartService) and get the same
// queue token for free, instead of declaring its own copy.
const queueRegistration = BullModule.registerQueue({
  name: QUEUE_ABANDONED_CART,
  ...queueDefaults,
});

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, User]),
    queueRegistration,
    NotificationsModule,
  ],
  providers: [AbandonedCartService],
  exports: [AbandonedCartService, queueRegistration],
})
export class AbandonedCartModule {}