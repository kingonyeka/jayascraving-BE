import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
export declare const EMAIL_QUEUE = "email";
export declare enum EmailJobType {
    ORDER_CONFIRMATION = "order_confirmation",
    ORDER_STATUS_UPDATE = "order_status_update",
    PAYMENT_RECEIPT = "payment_receipt",
    DELIVERY_REMINDER = "delivery_reminder",
    CUSTOM_ORDER_RECEIVED = "custom_order_received",
    CUSTOM_ORDER_QUOTE = "custom_order_quote",
    CUSTOM_ORDER_AGREEMENT = "custom_order_agreement",
    ABANDONED_CART_RECOVERY = "abandoned_cart_recovery"
}
export declare class EmailProcessor {
    private readonly configService;
    private readonly logger;
    private readonly resend;
    private readonly fromEmail;
    constructor(configService: ConfigService);
    handleOrderConfirmation(job: Job): Promise<void>;
    handleOrderStatusUpdate(job: Job): Promise<void>;
    handlePaymentReceipt(job: Job): Promise<void>;
    handleDeliveryReminder(job: Job): Promise<void>;
    handleAbandonedCartRecovery(job: Job): Promise<void>;
    handleCustomOrderReceived(job: Job): Promise<void>;
    handleCustomOrderQuote(job: Job): Promise<void>;
    handleCustomOrderAgreement(job: Job): Promise<void>;
    private send;
}
