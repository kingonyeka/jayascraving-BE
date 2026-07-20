import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { InitiatePaymentInput } from './dto/initiate-payment.input';
import { User } from '../users/entities/user.entity';
declare class InitiatePaymentResult {
    authorizationUrl: string;
    reference: string;
    payment: Payment;
}
export declare class PaymentsResolver {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    initiatePayment(user: User, input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
    verifyPayment(reference: string): Promise<Payment>;
    paymentByOrder(orderId: string): Promise<Payment | null>;
    myPayments(user: User): Promise<Payment[]>;
}
export {};
