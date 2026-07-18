import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InAppNotificationsService } from './in-app-notifications.service';
import { InAppNotificationsResolver } from './in-app-notifications.resolver';
import { Notification } from './entities/notification.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [InAppNotificationsService, InAppNotificationsResolver],
  exports: [InAppNotificationsService],
})
export class InAppNotificationsModule {}