import { Job } from 'bull';
import { Repository, DataSource } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { PaymentsService } from '../../payments/payments.service';
export declare class PaymentProcessor {
    private readonly paymentRepo;
    private readonly dataSource;
    private readonly paymentsService;
    private readonly logger;
    constructor(paymentRepo: Repository<Payment>, dataSource: DataSource, paymentsService: PaymentsService);
    handlePaymentVerify(job: Job<{
        reference: string;
    }>): Promise<void>;
    handlePaymentTimeout(job: Job<{
        paymentId: string;
    }>): Promise<void>;
}
