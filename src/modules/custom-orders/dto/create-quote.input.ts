import { Field, InputType, ID, Float } from '@nestjs/graphql';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

@InputType()
export class CreateQuoteInput {
  @Field(() => ID)
  @IsUUID()
  requestId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @Field(() => [String])
  @IsArray()
  lineItems: string[]; // JSON strings: ["{\"description\":\"6-tier cake\",\"amount\":45000}"]

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  message?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  terms?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}