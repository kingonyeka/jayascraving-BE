import { Field, InputType, ID, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum QuoteResponse {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  NEGOTIATE = 'NEGOTIATE',
}

registerEnumType(QuoteResponse, { name: 'QuoteResponse' });

@InputType()
export class RespondToQuoteInput {
  @Field(() => ID)
  @IsUUID()
  quoteId: string;

  @Field(() => QuoteResponse)
  @IsEnum(QuoteResponse)
  response: QuoteResponse;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  message?: string; // customer message — required when NEGOTIATE or REJECT
}