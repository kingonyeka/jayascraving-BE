import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { nanoid } from 'nanoid';
import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { InitiatePaymentInput } from './dto/initiate-payment.input';
import { PaystackWebhookDto } from './dto/paystack-webhook.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { RealTimeAnalyticsService } from '../real-time-analytics/real-time-analytics.service';
import { InAppNotificationsService } from '../in-app-notifications/in-app-notifications.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
import { QueuesService } from '../queues/queues.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
    private readonly realTimeAnalyticsService: RealTimeAnalyticsService,
    private readonly inAppNotificationsService: InAppNotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
    @Inject(forwardRef(() => QueuesService))
    private readonly queuesService: QueuesService,
  ) {}

  private get paystackSecret(): string {
    return this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  private get paystackHeaders() {
    return {
      Authorization: `Bearer ${this.paystackSecret}`,
      'Content-Type': 'application/json',
    };
  }

  // ─── Initiate payment ──────────────────────────────────────────────────────
  // Previously this method was fully implemented but had zero callers
  // anywhere in the codebase — no resolver or controller exposed it, so
  // there was no way for a frontend to actually start a Paystack
  // transaction. See PaymentsResolver.

  async initiatePayment(
    userId: string,
    userEmail: string,
    input: InitiatePaymentInput,
  ): Promise<{ authorizationUrl: string; reference: string; payment: Payment }> {
    const order = await this.orderRepo.findOne({ where: { id: input.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is not in a payable state');
    }

    // check for existing pending payment
    const existingPayment = await this.paymentRepo.findOne({
      where: { orderId: order.id, status: PaymentStatus.PENDING },
    });
    if (existingPayment) {
      // re-use existing reference
      const reInit = await this.initializePaystackTransaction(
        userEmail,
        order.total,
        existingPayment.paystackReference,
        order.id,
      );

      // Fallback in case the webhook never arrives — polls Paystack directly
      // after a short delay. Previously nothing ever called this.
      await this.schedulePaymentVerifyFallback(existingPayment.paystackReference, existingPayment.id);

      return {
        authorizationUrl: reInit.authorization_url,
        reference: existingPayment.paystackReference,
        payment: existingPayment,
      };
    }

    const reference = `JC-${nanoid(12).toUpperCase()}`;

    const paystackResponse = await this.initializePaystackTransaction(
      userEmail,
      order.total,
      reference,
      order.id,
    );

    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        orderId: order.id,
        userId,
        paystackReference: reference,
        amount: order.total,
        status: PaymentStatus.PENDING,
        method: input.method,
        currency: 'NGN',
      }),
    );

    // attach reference to order
    order.paymentReference = reference;
    order.paymentId = payment.id;
    await this.orderRepo.save(order);

    await this.schedulePaymentVerifyFallback(reference, payment.id);

    return {
      authorizationUrl: paystackResponse.authorization_url,
      reference,
      payment,
    };
  }

  // ─── Verify payment manually ───────────────────────────────────────────────
  // Called by the frontend after Paystack redirects back
  // (FRONTEND_URL/orders/verify?reference=...) — previously had no exposed
  // endpoint at all.

  async verifyPayment(reference: string): Promise<Payment> {
    const payment = await this.paymentRepo.findOne({
      where: { paystackReference: reference },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.status !== PaymentStatus.PENDING) {
      return payment; // already processed (likely by the webhook)
    }

    const response = await firstValueFrom(
      this.httpService.get(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        { headers: this.paystackHeaders },
      ),
    );

    const data = response.data?.data;
    if (!data) throw new BadRequestException('Invalid Paystack response');

    return this.processPaystackResult(payment.id, data);
  }

  // ─── Webhook handler ───────────────────────────────────────────────────────

  async handleWebhook(
    rawBody: Buffer,
    payload: PaystackWebhookDto,
    signature: string,
  ): Promise<void> {
    // Verify webhook signature over the exact raw request bytes.
    //
    // Previously this was computed as
    //   createHmac('sha512', secret).update(JSON.stringify(payload)).digest('hex')
    // — a re-serialization of the *parsed* body, not Paystack's original
    // bytes. That re-serialization isn't guaranteed to byte-for-byte match
    // what Paystack actually sent (key order, number formatting, etc. can
    // differ), which could silently fail signature verification for every
    // real webhook. Now HMAC'd directly over rawBody.
    const hash = createHmac('sha512', this.paystackSecret)
      .update(rawBody)
      .digest('hex');

    // Previously `hash !== signature` — a non-constant-time string
    // comparison, in principle vulnerable to timing attacks.
    const hashBuffer = Buffer.from(hash, 'hex');
    const signatureBuffer = Buffer.from(signature ?? '', 'hex');
    const validSignature =
      signature &&
      hashBuffer.length === signatureBuffer.length &&
      timingSafeEqual(hashBuffer, signatureBuffer);

    if (!validSignature) {
      this.logger.error('Invalid Paystack webhook signature — rejecting');
      return;
    }

    const { event, data } = payload;
    this.logger.log(`Paystack webhook received: ${event} | ref: ${data.reference}`);

    // Idempotency + concurrency fix: the lookup, PENDING check, and status
    // update now happen inside one transaction with a row lock held for its
    // duration. Previously these were separate, unlocked calls — two
    // near-simultaneous deliveries of the same event (which Paystack does
    // send on occasion) could both read status === PENDING before either
    // wrote, causing double-processing.
    await this.dataSource.transaction(async (manager) => {
      const payment = await manager.findOne(Payment, {
        where: { paystackReference: data.reference },
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        this.logger.warn(`Payment not found for reference: ${data.reference}`);
        return;
      }

      if (payment.status !== PaymentStatus.PENDING) {
        this.logger.log(`Payment ${data.reference} already processed, skipping`);
        return;
      }

      switch (event) {
        case 'charge.success':
          await this.processPaystackResult(payment.id, data, manager);
          break;

        case 'charge.failed':
          payment.status = PaymentStatus.FAILED;
          payment.failureReason = data.gateway_response;
          payment.paystackMeta = data as any;
          await manager.save(Payment, payment);
          break;

        case 'refund.processed':
          payment.status = PaymentStatus.REFUNDED;
          payment.paystackMeta = data as any;
          await manager.save(Payment, payment);
          await manager.update(
            Order,
            { id: payment.orderId },
            { status: OrderStatus.REFUNDED },
          );
          break;

        default:
          this.logger.log(`Unhandled Paystack event: ${event}`);
      }
    });
  }

  // ─── Get payment by order ──────────────────────────────────────────────────

  async getPaymentByOrder(orderId: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { orderId } });
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async schedulePaymentVerifyFallback(reference: string, paymentId: string) {
    // Polls Paystack directly ~1 minute after checkout in case the webhook
    // never arrives (dropped delivery, transient network issue, etc.).
    // Previously QueuesService.schedulePaymentVerify() was fully
    // implemented — including a working PaymentProcessor handler — but had
    // zero callers anywhere in the codebase.
    await this.queuesService.schedulePaymentVerify(reference);

    // Marks the payment FAILED if it's still PENDING 30 minutes after
    // checkout (mirrors OrdersService's own auto-cancel timeout for the
    // order itself). PaymentProcessor.handlePaymentTimeout already existed
    // and worked, but — like schedulePaymentVerify before this fix —
    // nothing ever called schedulePaymentTimeout() to actually queue it.
    await this.queuesService.schedulePaymentTimeout(paymentId, 30 * 60 * 1000);
  }

  private async initializePaystackTransaction(
    email: string,
    amountNaira: number,
    reference: string,
    orderId: string,
  ) {
    const amountKobo = Math.round(amountNaira * 100); // Paystack uses kobo

    const response = await firstValueFrom(
      this.httpService.post(
        `${this.paystackBaseUrl}/transaction/initialize`,
        {
          email,
          amount: amountKobo,
          reference,
          currency: 'NGN',
          metadata: { orderId },
          callback_url: `${this.configService.get('FRONTEND_URL')}/orders/verify?reference=${reference}`,
        },
        { headers: this.paystackHeaders },
      ),
    );

    return response.data?.data;
  }

  private async processPaystackResult(
    paymentId: string,
    data: any,
    manager?: EntityManager,
  ): Promise<Payment> {
    const repo = manager ? manager.getRepository(Payment) : this.paymentRepo;
    const orderRepo = manager ? manager.getRepository(Order) : this.orderRepo;

    const payment = await repo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status =
      data.status === 'success' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    payment.paystackTransactionId = String(data.id);
    payment.channel = data.channel;
    payment.paystackMeta = data;
    payment.failureReason = data.status !== 'success' ? data.gateway_response : undefined;
    payment.paidAt = data.paid_at ? new Date(data.paid_at) : undefined;

    await repo.save(payment);

    if (payment.status === PaymentStatus.SUCCESS) {
      await orderRepo.update(
        { id: payment.orderId },
        { status: OrderStatus.CONFIRMED },
      );

      // Fire-and-forget side effects — previously
      // NotificationsService.sendPaymentReceipt(), the live analytics feed,
      // and both notification channels were never triggered from anywhere.
      await this.notifyPaymentSuccess(payment).catch((err) =>
        this.logger.error(`Post-payment notifications failed: ${err?.message}`),
      );
    }

    return payment;
  }

  private async notifyPaymentSuccess(payment: Payment): Promise<void> {
    const order = await this.orderRepo.findOne({ where: { id: payment.orderId } });
    if (!order) return;

    const user = await this.userRepo.findOne({ where: { id: payment.userId } });

    if (user) {
      await this.notificationsService.sendPaymentReceipt(user.email, {
        customerName: user.fullName,
        orderNumber: order.orderNumber,
        amount: Number(payment.amount),
        paymentReference: payment.paystackReference,
        paymentMethod: payment.method,
        paidAt: payment.paidAt ? payment.paidAt.toDateString() : new Date().toDateString(),
      });

      await this.inAppNotificationsService.notifyPaymentSuccess(
        user.id, order.orderNumber, order.id, Number(payment.amount),
      );

      if (user.fcmToken) {
        await this.pushNotificationsService.notifyPaymentSuccess(
          user.fcmToken, order.orderNumber, Number(payment.amount),
        );
      }
    }

    this.realTimeAnalyticsService.emitPaymentReceived({
      id: payment.id,
      amount: Number(payment.amount),
      orderId: payment.orderId,
    });
  }
}
