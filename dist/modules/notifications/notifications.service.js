"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const email_processor_1 = require("./processors/email.processor");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(emailQueue) {
        this.emailQueue = emailQueue;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendOrderConfirmation(to, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.ORDER_CONFIRMATION, { to, data });
        this.logger.log(`Queued order confirmation email to ${to}`);
    }
    async sendOrderStatusUpdate(to, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.ORDER_STATUS_UPDATE, { to, data });
        this.logger.log(`Queued order status update email to ${to}`);
    }
    async sendPaymentReceipt(to, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.PAYMENT_RECEIPT, { to, data });
        this.logger.log(`Queued payment receipt email to ${to}`);
    }
    async sendDeliveryReminder(to, data, delay) {
        await this.emailQueue.add(email_processor_1.EmailJobType.DELIVERY_REMINDER, { to, data }, { delay });
        this.logger.log(`Queued delivery reminder email to ${to}${delay ? ` (delayed ${delay}ms)` : ''}`);
    }
    async sendCustomOrderReceived(to, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.CUSTOM_ORDER_RECEIVED, { to, data });
        this.logger.log(`Queued custom order received email to ${to}`);
    }
    async sendCustomOrderQuote(to, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.CUSTOM_ORDER_QUOTE, { to, data });
        this.logger.log(`Queued custom order quote email to ${to}`);
    }
    async sendCustomOrderAgreement(to, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.CUSTOM_ORDER_AGREEMENT, { to, data });
        this.logger.log(`Queued custom order agreement email to ${to}`);
    }
    async sendAbandonedCartRecovery(to, data, delay) {
        await this.emailQueue.add(email_processor_1.EmailJobType.ABANDONED_CART_RECOVERY, { to, data }, { delay });
        this.logger.log(`Queued abandoned cart recovery email to ${to}${delay ? ` (delayed ${delay}ms)` : ''}`);
    }
    async sendLowStockAlert(adminEmail, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.CUSTOM_ORDER_RECEIVED, {
            to: adminEmail,
            data: {
                customerName: 'Admin',
                requestNumber: `LOW-STOCK-${data.productName}`,
                message: `${data.productName} is low on stock: ${data.stockCount} unit(s) left (threshold: ${data.threshold}). Restock soon.`,
            },
        });
        this.logger.log(`Queued low-stock alert to ${adminEmail} for ${data.productName}`);
    }
    async notifyAdminNewCustomOrder(adminEmail, data) {
        await this.emailQueue.add(email_processor_1.EmailJobType.CUSTOM_ORDER_RECEIVED, {
            to: adminEmail,
            data: {
                customerName: 'Admin',
                requestNumber: data.requestNumber,
                message: `New custom order from ${data.customerName} for ${data.occasion}`,
            },
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)(email_processor_1.EMAIL_QUEUE)),
    __metadata("design:paramtypes", [Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map