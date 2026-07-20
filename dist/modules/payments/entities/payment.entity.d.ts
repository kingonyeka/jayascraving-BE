import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { PaymentMethod } from '../../orders/entities/order.entity';
export declare class Payment {
    id: string;
    orderId: string;
    userId: string;
    paystackReference: string;
    paystackTransactionId?: string;
    amount: number;
    status: PaymentStatus;
    method?: PaymentMethod;
    channel?: string;
    currency?: string;
    paystackMeta?: Record<string, any>;
    failureReason?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
