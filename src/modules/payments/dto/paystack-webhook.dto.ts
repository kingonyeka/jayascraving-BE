import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';

// Previously these were plain TypeScript `interface`s. Interfaces vanish at
// compile time, so Nest's global ValidationPipe saw the parameter's
// reflected metatype as `Object` and silently skipped validation entirely —
// this webhook accepted and processed any JSON shape at runtime with zero
// shape enforcement. Converting to real classes with class-validator
// decorators makes the ValidationPipe actually validate incoming payloads.

class PaystackCustomerDto {
  @IsNumber()
  id: number;

  @IsString()
  email: string;
}

class PaystackAuthorizationDto {
  @IsString()
  authorization_code: string;

  @IsOptional() @IsString()
  card_type?: string;

  @IsOptional() @IsString()
  bank?: string;

  @IsOptional() @IsString()
  channel?: string;
}

export class PaystackWebhookDataDto {
  @IsNumber()
  id: number;

  @IsString()
  domain: string;

  @IsString()
  status: string;

  @IsString()
  reference: string;

  @IsNumber()
  amount: number; // in kobo

  @IsOptional() @IsString()
  message?: string;

  @IsString()
  gateway_response: string;

  @IsOptional() @IsString()
  paid_at?: string;

  @IsOptional() @IsString()
  channel?: string;

  @IsOptional() @IsString()
  currency?: string;

  @ValidateNested()
  @Type(() => PaystackCustomerDto)
  customer: PaystackCustomerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaystackAuthorizationDto)
  authorization?: PaystackAuthorizationDto;

  @IsOptional() @IsObject()
  metadata?: any;
}

export class PaystackWebhookDto {
  @IsString()
  event: string; // e.g. "charge.success", "charge.failed", "refund.processed"

  @ValidateNested()
  @Type(() => PaystackWebhookDataDto)
  data: PaystackWebhookDataDto;
}
