import { Field, InputType, ID } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatus } from '../../../common/enums/order-status.enum';

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}