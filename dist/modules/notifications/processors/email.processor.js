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
var EmailProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProcessor = exports.EmailJobType = exports.EMAIL_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
const config_1 = require("@nestjs/config");
const order_confirmation_template_1 = require("../templates/order-confirmation.template");
const order_status_update_template_1 = require("../templates/order-status-update.template");
const payment_receipt_template_1 = require("../templates/payment-receipt.template");
const delivery_reminder_template_1 = require("../templates/delivery-reminder.template");
const abandoned_cart_recovery_template_1 = require("../templates/abandoned-cart-recovery.template");
exports.EMAIL_QUEUE = 'email';
var EmailJobType;
(function (EmailJobType) {
    EmailJobType["ORDER_CONFIRMATION"] = "order_confirmation";
    EmailJobType["ORDER_STATUS_UPDATE"] = "order_status_update";
    EmailJobType["PAYMENT_RECEIPT"] = "payment_receipt";
    EmailJobType["DELIVERY_REMINDER"] = "delivery_reminder";
    EmailJobType["CUSTOM_ORDER_RECEIVED"] = "custom_order_received";
    EmailJobType["CUSTOM_ORDER_QUOTE"] = "custom_order_quote";
    EmailJobType["CUSTOM_ORDER_AGREEMENT"] = "custom_order_agreement";
    EmailJobType["ABANDONED_CART_RECOVERY"] = "abandoned_cart_recovery";
})(EmailJobType || (exports.EmailJobType = EmailJobType = {}));
let EmailProcessor = EmailProcessor_1 = class EmailProcessor {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailProcessor_1.name);
        this.resend = new resend_1.Resend(configService.get('RESEND_API_KEY'));
        this.fromEmail = configService.get('EMAIL_FROM');
    }
    async handleOrderConfirmation(job) {
        const { to, data } = job.data;
        const { subject, html } = (0, order_confirmation_template_1.orderConfirmationTemplate)(data);
        await this.send(to, subject, html, job.id);
    }
    async handleOrderStatusUpdate(job) {
        const { to, data } = job.data;
        const { subject, html } = (0, order_status_update_template_1.orderStatusUpdateTemplate)(data);
        await this.send(to, subject, html, job.id);
    }
    async handlePaymentReceipt(job) {
        const { to, data } = job.data;
        const { subject, html } = (0, payment_receipt_template_1.paymentReceiptTemplate)(data);
        await this.send(to, subject, html, job.id);
    }
    async handleDeliveryReminder(job) {
        const { to, data } = job.data;
        const { subject, html } = (0, delivery_reminder_template_1.deliveryReminderTemplate)(data);
        await this.send(to, subject, html, job.id);
    }
    async handleAbandonedCartRecovery(job) {
        const { to, data } = job.data;
        const { subject, html } = (0, abandoned_cart_recovery_template_1.abandonedCartRecoveryTemplate)(data);
        await this.send(to, subject, html, job.id);
    }
    async handleCustomOrderReceived(job) {
        const { to, data } = job.data;
        await this.send(to, `Custom Order Received — ${data.requestNumber} | Jayascravings`, `<p>Hi ${data.customerName}, we've received your custom cake request <strong>${data.requestNumber}</strong>. Our team will review it and get back to you shortly.</p>`, job.id);
    }
    async handleCustomOrderQuote(job) {
        const { to, data } = job.data;
        await this.send(to, `Quote Ready — ${data.requestNumber} | Jayascravings`, `<p>Hi ${data.customerName}, your quote for request <strong>${data.requestNumber}</strong> is ready. Total: <strong>₦${Number(data.totalAmount).toLocaleString()}</strong>. Log in to review and respond.</p>`, job.id);
    }
    async handleCustomOrderAgreement(job) {
        const { to, data } = job.data;
        await this.send(to, `Order Agreement — ${data.agreementNumber} | Jayascravings`, `<p>Hi ${data.customerName}, your order agreement <strong>${data.agreementNumber}</strong> is ready. Please log in to review and sign.</p>`, job.id);
    }
    async send(to, subject, html, jobId) {
        try {
            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent [job:${jobId}] to ${to} | subject: ${subject} | id: ${result.data?.id}`);
        }
        catch (error) {
            this.logger.error(`Email failed [job:${jobId}] to ${to}: ${error?.message ?? error}`);
            throw error;
        }
    }
};
exports.EmailProcessor = EmailProcessor;
__decorate([
    (0, bull_1.Process)(EmailJobType.ORDER_CONFIRMATION),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleOrderConfirmation", null);
__decorate([
    (0, bull_1.Process)(EmailJobType.ORDER_STATUS_UPDATE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleOrderStatusUpdate", null);
__decorate([
    (0, bull_1.Process)(EmailJobType.PAYMENT_RECEIPT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handlePaymentReceipt", null);
__decorate([
    (0, bull_1.Process)(EmailJobType.DELIVERY_REMINDER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleDeliveryReminder", null);
__decorate([
    (0, bull_1.Process)(EmailJobType.ABANDONED_CART_RECOVERY),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleAbandonedCartRecovery", null);
__decorate([
    (0, bull_1.Process)(EmailJobType.CUSTOM_ORDER_RECEIVED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleCustomOrderReceived", null);
__decorate([
    (0, bull_1.Process)(EmailJobType.CUSTOM_ORDER_QUOTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleCustomOrderQuote", null);
__decorate([
    (0, bull_1.Process)(EmailJobType.CUSTOM_ORDER_AGREEMENT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailProcessor.prototype, "handleCustomOrderAgreement", null);
exports.EmailProcessor = EmailProcessor = EmailProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.EMAIL_QUEUE),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailProcessor);
//# sourceMappingURL=email.processor.js.map