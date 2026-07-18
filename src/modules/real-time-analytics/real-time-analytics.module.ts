import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealTimeAnalyticsService } from './real-time-analytics.service';
import { RealTimeAnalyticsController } from './real-time-analytics.controller';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Global() // global so RealTimeAnalyticsService can be injected into OrdersService, PaymentsService etc.
@Module({
  imports: [TypeOrmModule.forFeature([Order, Payment, User])],
  providers: [RealTimeAnalyticsService],
  controllers: [RealTimeAnalyticsController],
  exports: [RealTimeAnalyticsService],
})
export class RealTimeAnalyticsModule {}