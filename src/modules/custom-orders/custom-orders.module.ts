import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomOrdersService } from './custom-orders.service';
import { CustomOrdersResolver } from './custom-orders.resolver';
import { CustomOrderRequest } from './entities/custom-order-request.entity';
import { CustomOrderQuote } from './entities/custom-order-quote.entity';
import { CustomOrderAgreement } from './entities/custom-order-agreement.entity';
import { CustomOrderPayment } from './entities/custom-order-payment.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
// InAppNotificationsModule and PushNotificationsModule are @Global()
// (registered once in app.module.ts) so their services are injectable here
// without needing to be listed in `imports`.

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomOrderRequest,
      CustomOrderQuote,
      CustomOrderAgreement,
      CustomOrderPayment,
      User,
    ]),
    // Previously this module didn't import NotificationsModule at all, so
    // CustomOrdersService structurally could not have called it even if it
    // had tried — every custom-order email (received/quote/agreement) and
    // the admin new-request alert were unreachable.
    NotificationsModule,
  ],
  providers: [CustomOrdersService, CustomOrdersResolver],
  exports: [CustomOrdersService],
})
export class CustomOrdersModule {}
