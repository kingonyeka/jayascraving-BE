import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PaystackWebhookDto } from './dto/paystack-webhook.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly logger;
    constructor(paymentsService: PaymentsService);
    handleWebhook(req: Request & {
        rawBody?: Buffer;
    }, payload: PaystackWebhookDto, signature: string): Promise<{
        status: string;
    }>;
}
