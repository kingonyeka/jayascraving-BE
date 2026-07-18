import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsService } from './promotions.service';
import { PromotionsResolver } from './promotions.resolver';
import { PromoCode } from './entities/promo-code.entity';
import { PromoUsage } from './entities/promo-usage.entity';
import { User } from '../users/entities/user.entity';
// InAppNotificationsModule and PushNotificationsModule are @Global()
// (registered once in app.module.ts) so their services are injectable here
// without needing to be listed in `imports`.

@Module({
  imports: [TypeOrmModule.forFeature([PromoCode, PromoUsage, User])],
  providers: [PromotionsService, PromotionsResolver],
  exports: [PromotionsService],
})
export class PromotionsModule {}