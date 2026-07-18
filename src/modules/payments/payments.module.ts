import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsResolver } from './payments.resolver';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { QueuesModule } from '../queues/queues.module';
// RealTimeAnalyticsModule, InAppNotificationsModule and PushNotificationsModule
// are @Global() (registered once in app.module.ts) so their services are
// injectable here without needing to be listed in `imports`.

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, User]),
    HttpModule,
    NotificationsModule,
    // forwardRef: PaymentsModule needs QueuesService (to schedule the
    // payment-verify/timeout jobs), and QueuesModule's PaymentProcessor now
    // needs PaymentsService (to reuse the transaction-safe, notification-
    // wired verify path — see payment.processor.ts) — a genuine two-way
    // dependency between these modules.
    forwardRef(() => QueuesModule),
  ],
  providers: [PaymentsService, PaymentsResolver],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
