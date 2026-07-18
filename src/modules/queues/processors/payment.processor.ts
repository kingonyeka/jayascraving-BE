import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import {
  QUEUE_PAYMENT,
  JOB_PAYMENT_VERIFY,
  JOB_PAYMENT_TIMEOUT,
} from '../jobs/queue.constants';
import { PaymentsService } from '../../payments/payments.service';

@Processor(QUEUE_PAYMENT)
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    private readonly dataSource: DataSource,
    // forwardRef closes the circular dependency: PaymentsModule imports
    // QueuesModule (for schedulePaymentVerify / schedulePaymentTimeout),
    // and QueuesModule's PaymentProcessor needs PaymentsService in return
    // — see payments.module.ts and queues.module.ts for the module-level
    // forwardRef() wiring.
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  // poll Paystack to verify a payment that hasn't received a webhook yet
  @Process(JOB_PAYMENT_VERIFY)
  async handlePaymentVerify(job: Job<{ reference: string }>) {
    const { reference } = job.data;
    this.logger.log(`Verifying payment reference: ${reference}`);

    const payment = await this.paymentRepo.findOne({
      where: { paystackReference: reference },
    });

    if (!payment || payment.status !== PaymentStatus.PENDING) return;

    try {
      // Delegate entirely to PaymentsService.verifyPayment() — it calls
      // Paystack itself and runs the same transaction-locked,
      // notification-wired processing path used by the manual "verify"
      // endpoint. Previously this handler duplicated the Paystack HTTP call
      // and the DB update inline, with no row lock (a real race risk if the
      // webhook and this poll both landed at once) and, critically, never
      // sent the receipt email, never notified in-app/push, and never
      // emitted the live-analytics event — so a payment confirmed only via
      // this fallback path was invisible to the customer and the admin
      // dashboard.
      const result = await this.paymentsService.verifyPayment(reference);
      if (result.status === PaymentStatus.SUCCESS) {
        this.logger.log(`Payment ${reference} verified successfully via polling`);
      }
    } catch (error: any) {
      this.logger.error(`Payment verification failed for ${reference}: ${error?.message}`);
      throw error; // Bull will retry
    }
  }

  // mark payment as failed after timeout
  @Process(JOB_PAYMENT_TIMEOUT)
  async handlePaymentTimeout(job: Job<{ paymentId: string }>) {
    const { paymentId } = job.data;

    // Locked the same way as the webhook handler — this can race against a
    // webhook or a verify-poll landing at nearly the same moment.
    await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!payment || payment.status !== PaymentStatus.PENDING) return;

      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Payment timed out';
      await manager.save(Payment, payment);
      this.logger.log(`Payment ${paymentId} marked as failed due to timeout`);
    });
  }
}
