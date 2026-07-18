import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderCustomisation } from './entities/order-customisation.entity';
import { User } from '../users/entities/user.entity';
import { CartModule } from '../cart/cart.module';
import { QueuesModule } from '../queues/queues.module';
import { StaffModule } from '../staff/staff.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AbandonedCartModule } from '../abandoned-cart/abandoned-cart.module';
// RealTimeAnalyticsModule, InAppNotificationsModule and PushNotificationsModule
// are all @Global(), so their services are injectable here without adding
// them to `imports` — but they must be registered somewhere in AppModule
// for that to take effect (see app.module.ts).

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderCustomisation, User]),
    CartModule,
    QueuesModule,
    StaffModule,
    PromotionsModule,
    NotificationsModule,
    AbandonedCartModule,
  ],
  providers: [OrdersService, OrdersResolver],
  exports: [OrdersService],
})
export class OrdersModule {}
