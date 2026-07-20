import { PaymentMethod } from '../../orders/entities/order.entity';
export declare class InitiatePaymentInput {
    orderId: string;
    method: PaymentMethod;
}
