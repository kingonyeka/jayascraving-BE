import { Module, Global } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';

@Global() // global so PushNotificationsService injectable anywhere without reimporting
@Module({
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}