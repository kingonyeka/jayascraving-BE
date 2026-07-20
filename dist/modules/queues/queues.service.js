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
var QueuesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const queue_constants_1 = require("./jobs/queue.constants");
let QueuesService = QueuesService_1 = class QueuesService {
    constructor(orderQueue, paymentQueue, inventoryQueue, cartQueue) {
        this.orderQueue = orderQueue;
        this.paymentQueue = paymentQueue;
        this.inventoryQueue = inventoryQueue;
        this.cartQueue = cartQueue;
        this.logger = new common_1.Logger(QueuesService_1.name);
    }
    async scheduleAutoCancel(orderId, delayMs) {
        await this.orderQueue.add(queue_constants_1.JOB_ORDER_AUTO_CANCEL, { orderId }, { delay: delayMs, jobId: `auto-cancel:${orderId}` });
        this.logger.log(`Scheduled auto-cancel for order ${orderId} in ${delayMs / 60000} minutes`);
    }
    async cancelAutoCancel(orderId) {
        const job = await this.orderQueue.getJob(`auto-cancel:${orderId}`);
        if (job) {
            await job.remove();
            this.logger.log(`Cancelled auto-cancel job for order ${orderId}`);
        }
    }
    async scheduleDeliveryReminder(orderId, userEmail, delayMs) {
        await this.orderQueue.add(queue_constants_1.JOB_ORDER_DELIVERY_REMINDER, { orderId, userEmail }, { delay: delayMs, jobId: `delivery-reminder:${orderId}` });
    }
    async schedulePaymentVerify(reference, delayMs = 60000) {
        await this.paymentQueue.add(queue_constants_1.JOB_PAYMENT_VERIFY, { reference }, { delay: delayMs, attempts: 3 });
    }
    async schedulePaymentTimeout(paymentId, delayMs) {
        await this.paymentQueue.add(queue_constants_1.JOB_PAYMENT_TIMEOUT, { paymentId }, { delay: delayMs, jobId: `payment-timeout:${paymentId}` });
    }
    async runLowStockCheck() {
        await this.inventoryQueue.add(queue_constants_1.JOB_INVENTORY_LOW_STOCK_ALERT, {});
    }
    async scheduleStockUpdate(productId, quantity) {
        await this.inventoryQueue.add(queue_constants_1.JOB_INVENTORY_STOCK_UPDATE, { productId, quantity });
    }
    async getQueueStats() {
        const [orderCounts, paymentCounts, inventoryCounts, cartCounts] = await Promise.all([
            this.orderQueue.getJobCounts(),
            this.paymentQueue.getJobCounts(),
            this.inventoryQueue.getJobCounts(),
            this.cartQueue.getJobCounts(),
        ]);
        return {
            order: orderCounts,
            payment: paymentCounts,
            inventory: inventoryCounts,
            cart: cartCounts,
        };
    }
};
exports.QueuesService = QueuesService;
exports.QueuesService = QueuesService = QueuesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)(queue_constants_1.QUEUE_ORDER)),
    __param(1, (0, bull_1.InjectQueue)(queue_constants_1.QUEUE_PAYMENT)),
    __param(2, (0, bull_1.InjectQueue)(queue_constants_1.QUEUE_INVENTORY)),
    __param(3, (0, bull_1.InjectQueue)(queue_constants_1.QUEUE_ABANDONED_CART)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], QueuesService);
//# sourceMappingURL=queues.service.js.map