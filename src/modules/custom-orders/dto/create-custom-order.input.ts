import { Field, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class CreateCustomOrderInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  occasion: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  approximateBudget?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  preferredDeliveryDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  preferredDeliveryTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerNotes?: string;
}