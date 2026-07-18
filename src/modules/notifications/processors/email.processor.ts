import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { orderConfirmationTemplate } from '../templates/order-confirmation.template';
import { orderStatusUpdateTemplate } from '../templates/order-status-update.template';
import { paymentReceiptTemplate } from '../templates/payment-receipt.template';
import { deliveryReminderTemplate } from '../templates/delivery-reminder.template';
import { abandonedCartRecoveryTemplate } from '../templates/abandoned-cart-recovery.template';

export const EMAIL_QUEUE = 'email';

export enum EmailJobType {
  ORDER_CONFIRMATION = 'order_confirmation',
  ORDER_STATUS_UPDATE = 'order_status_update',
  PAYMENT_RECEIPT = 'payment_receipt',
  DELIVERY_REMINDER = 'delivery_reminder',
  CUSTOM_ORDER_RECEIVED = 'custom_order_received',
  CUSTOM_ORDER_QUOTE = 'custom_order_quote',
  CUSTOM_ORDER_AGREEMENT = 'custom_order_agreement',
  ABANDONED_CART_RECOVERY = 'abandoned_cart_recovery',
}

@Processor(EMAIL_QUEUE)
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(configService.get<string>('RESEND_API_KEY'));
    this.fromEmail = configService.get<string>('EMAIL_FROM');
  }

  @Process(EmailJobType.ORDER_CONFIRMATION)
  async handleOrderConfirmation(job: Job) {
    const { to, data } = job.data;
    const { subject, html } = orderConfirmationTemplate(data);
    await this.send(to, subject, html, job.id);
  }

  @Process(EmailJobType.ORDER_STATUS_UPDATE)
  async handleOrderStatusUpdate(job: Job) {
    const { to, data } = job.data;
    const { subject, html } = orderStatusUpdateTemplate(data);
    await this.send(to, subject, html, job.id);
  }

  @Process(EmailJobType.PAYMENT_RECEIPT)
  async handlePaymentReceipt(job: Job) {
    const { to, data } = job.data;
    const { subject, html } = paymentReceiptTemplate(data);
    await this.send(to, subject, html, job.id);
  }

  @Process(EmailJobType.DELIVERY_REMINDER)
  async handleDeliveryReminder(job: Job) {
    const { to, data } = job.data;
    const { subject, html } = deliveryReminderTemplate(data);
    await this.send(to, subject, html, job.id);
  }

  @Process(EmailJobType.ABANDONED_CART_RECOVERY)
  async handleAbandonedCartRecovery(job: Job) {
    const { to, data } = job.data;
    const { subject, html } = abandonedCartRecoveryTemplate(data);
    await this.send(to, subject, html, job.id);
  }

  @Process(EmailJobType.CUSTOM_ORDER_RECEIVED)
  async handleCustomOrderReceived(job: Job) {
    const { to, data } = job.data;
    await this.send(
      to,
      `Custom Order Received — ${data.requestNumber} | Jayascravings`,
      `<p>Hi ${data.customerName}, we've received your custom cake request <strong>${data.requestNumber}</strong>. Our team will review it and get back to you shortly.</p>`,
      job.id,
    );
  }

  @Process(EmailJobType.CUSTOM_ORDER_QUOTE)
  async handleCustomOrderQuote(job: Job) {
    const { to, data } = job.data;
    await this.send(
      to,
      `Quote Ready — ${data.requestNumber} | Jayascravings`,
      `<p>Hi ${data.customerName}, your quote for request <strong>${data.requestNumber}</strong> is ready. Total: <strong>₦${Number(data.totalAmount).toLocaleString()}</strong>. Log in to review and respond.</p>`,
      job.id,
    );
  }

  @Process(EmailJobType.CUSTOM_ORDER_AGREEMENT)
  async handleCustomOrderAgreement(job: Job) {
    const { to, data } = job.data;
    await this.send(
      to,
      `Order Agreement — ${data.agreementNumber} | Jayascravings`,
      `<p>Hi ${data.customerName}, your order agreement <strong>${data.agreementNumber}</strong> is ready. Please log in to review and sign.</p>`,
      job.id,
    );
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    jobId: string | number,
  ): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent [job:${jobId}] to ${to} | subject: ${subject} | id: ${result.data?.id}`);
    } catch (error: any) {
      this.logger.error(`Email failed [job:${jobId}] to ${to}: ${error?.message ?? error}`);
      throw error; // re-throw so Bull retries the job
    }
  }
}