import {
  Controller,
  Post,
  Headers,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PaystackWebhookDto } from './dto/paystack-webhook.dto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  // POST /api/payments/webhook
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    // Route-local ValidationPipe override: `whitelist`/`forbidNonWhitelisted`
    // are OFF here even though they're ON globally (see main.ts). Paystack's
    // real payloads carry many more fields than PaystackWebhookDto declares
    // (fees, plan objects, pos_transaction_data, etc.) — with the global
    // pipe's settings applied, every real webhook would get rejected with a
    // 400 before it even reached signature verification. This still runs
    // class-validator's @IsString/@IsNumber/etc. checks and builds real
    // nested class instances (fixing the original "DTO was a bare interface,
    // so validation never ran at all" bug) without being strict about
    // unknown extra fields we don't read.
    @Body(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
    payload: PaystackWebhookDto,
    @Headers('x-paystack-signature') signature: string,
  ): Promise<{ status: string }> {
    this.logger.log(`Paystack webhook event: ${payload.event}`);

    // Requires `rawBody: true` in NestFactory.create() (see main.ts) so the
    // exact raw request bytes are available here. Previously the signature
    // was computed over `JSON.stringify(payload)` — a re-serialization of
    // the *parsed* body — which is not guaranteed to reproduce Paystack's
    // original byte sequence and could cause every real webhook to fail
    // signature verification silently.
    if (!req.rawBody) {
      throw new BadRequestException('Raw body unavailable — check rawBody bootstrap option');
    }

    await this.paymentsService.handleWebhook(req.rawBody, payload, signature);
    return { status: 'ok' };
  }
}
