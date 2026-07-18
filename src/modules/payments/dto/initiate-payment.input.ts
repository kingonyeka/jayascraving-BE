import { Field, InputType, ID } from '@nestjs/graphql';
import { IsEnum, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../orders/entities/order.entity';

@InputType()
export class InitiatePaymentInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}