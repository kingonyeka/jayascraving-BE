import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { DeliveryType } from '../entities/order.entity';

@InputType()
export class CreateOrderInput {
  @Field(() => DeliveryType)
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  // delivery fields — required when deliveryType is DELIVERY
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  deliveryAddressId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryRecipientName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryStreet?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryTimeSlot?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}