import { Queue } from 'bull';
import { OrderConfirmationData } from './templates/order-confirmation.template';
import { OrderStatusUpdateData } from './templates/order-status-update.template';
import { PaymentReceiptData } from './templates/payment-receipt.template';
import { DeliveryReminderData } from './templates/delivery-reminder.template';
import { AbandonedCartRecoveryData } from './templates/abandoned-cart-recovery.template';
export declare class NotificationsService {
    private readonly emailQueue;
    private readonly logger;
    constructor(emailQueue: Queue);
    sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void>;
    sendOrderStatusUpdate(to: string, data: OrderStatusUpdateData): Promise<void>;
    sendPaymentReceipt(to: string, data: PaymentReceiptData): Promise<void>;
    sendDeliveryReminder(to: string, data: DeliveryReminderData, delay?: number): Promise<void>;
    sendCustomOrderReceived(to: string, data: {
        customerName: string;
        requestNumber: string;
    }): Promise<void>;
    sendCustomOrderQuote(to: string, data: {
        customerName: string;
        requestNumber: string;
        totalAmount: number;
    }): Promise<void>;
    sendCustomOrderAgreement(to: string, data: {
        customerName: string;
        agreementNumber: string;
    }): Promise<void>;
    sendAbandonedCartRecovery(to: string, data: AbandonedCartRecoveryData, delay?: number): Promise<void>;
    sendLowStockAlert(adminEmail: string, data: {
        productName: string;
        stockCount: number;
        threshold: number;
    }): Promise<void>;
    notifyAdminNewCustomOrder(adminEmail: string, data: {
        requestNumber: string;
        customerName: string;
        occasion: string;
    }): Promise<void>;
}
