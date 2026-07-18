import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EMAIL_QUEUE, EmailJobType } from './processors/email.processor';
import { OrderConfirmationData } from './templates/order-confirmation.template';
import { OrderStatusUpdateData } from './templates/order-status-update.template';
import { PaymentReceiptData } from './templates/payment-receipt.template';
import { DeliveryReminderData } from './templates/delivery-reminder.template';
import { AbandonedCartRecoveryData } from './templates/abandoned-cart-recovery.template';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  // ─── Order emails ──────────────────────────────────────────────────────────

  async sendOrderConfirmation(
    to: string,
    data: OrderConfirmationData,
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.ORDER_CONFIRMATION, { to, data });
    this.logger.log(`Queued order confirmation email to ${to}`);
  }

  async sendOrderStatusUpdate(
    to: string,
    data: OrderStatusUpdateData,
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.ORDER_STATUS_UPDATE, { to, data });
    this.logger.log(`Queued order status update email to ${to}`);
  }

  async sendPaymentReceipt(
    to: string,
    data: PaymentReceiptData,
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.PAYMENT_RECEIPT, { to, data });
    this.logger.log(`Queued payment receipt email to ${to}`);
  }

  async sendDeliveryReminder(
    to: string,
    data: DeliveryReminderData,
    delay?: number, // delay in ms — schedule for the day before delivery
  ): Promise<void> {
    await this.emailQueue.add(
      EmailJobType.DELIVERY_REMINDER,
      { to, data },
      { delay },
    );
    this.logger.log(`Queued delivery reminder email to ${to}${delay ? ` (delayed ${delay}ms)` : ''}`);
  }

  // ─── Custom order emails ───────────────────────────────────────────────────

  async sendCustomOrderReceived(
    to: string,
    data: { customerName: string; requestNumber: string },
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.CUSTOM_ORDER_RECEIVED, { to, data });
    this.logger.log(`Queued custom order received email to ${to}`);
  }

  async sendCustomOrderQuote(
    to: string,
    data: { customerName: string; requestNumber: string; totalAmount: number },
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.CUSTOM_ORDER_QUOTE, { to, data });
    this.logger.log(`Queued custom order quote email to ${to}`);
  }

  async sendCustomOrderAgreement(
    to: string,
    data: { customerName: string; agreementNumber: string },
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.CUSTOM_ORDER_AGREEMENT, { to, data });
    this.logger.log(`Queued custom order agreement email to ${to}`);
  }

  // ─── Cart recovery ──────────────────────────────────────────────────────────

  async sendAbandonedCartRecovery(
    to: string,
    data: AbandonedCartRecoveryData,
    delay?: number,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailJobType.ABANDONED_CART_RECOVERY,
      { to, data },
      { delay },
    );
    this.logger.log(`Queued abandoned cart recovery email to ${to}${delay ? ` (delayed ${delay}ms)` : ''}`);
  }

  // ─── Admin notification ────────────────────────────────────────────────────

  async sendLowStockAlert(
    adminEmail: string,
    data: { productName: string; stockCount: number; threshold: number },
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.CUSTOM_ORDER_RECEIVED, {
      to: adminEmail,
      data: {
        customerName: 'Admin',
        requestNumber: `LOW-STOCK-${data.productName}`,
        message: `${data.productName} is low on stock: ${data.stockCount} unit(s) left (threshold: ${data.threshold}). Restock soon.`,
      },
    });
    this.logger.log(`Queued low-stock alert to ${adminEmail} for ${data.productName}`);
  }

  async notifyAdminNewCustomOrder(
    adminEmail: string,
    data: { requestNumber: string; customerName: string; occasion: string },
  ): Promise<void> {
    await this.emailQueue.add(EmailJobType.CUSTOM_ORDER_RECEIVED, {
      to: adminEmail,
      data: {
        customerName: 'Admin',
        requestNumber: data.requestNumber,
        message: `New custom order from ${data.customerName} for ${data.occasion}`,
      },
    });
  }
}