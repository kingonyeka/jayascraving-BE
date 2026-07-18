import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DeliveryResolver } from './delivery.resolver';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryZone, DeliverySlot])],
  providers: [DeliveryService, DeliveryResolver],
  exports: [DeliveryService],
})
export class DeliveryModule {}