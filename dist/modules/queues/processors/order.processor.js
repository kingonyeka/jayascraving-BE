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
var OrderProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../../orders/entities/order.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const order_status_enum_1 = require("../../../common/enums/order-status.enum");
const notifications_service_1 = require("../../notifications/notifications.service");
const queue_constants_1 = require("../jobs/queue.constants");
let OrderProcessor = OrderProcessor_1 = class OrderProcessor {
    constructor(orderRepo, userRepo, notificationsService) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(OrderProcessor_1.name);
    }
    async handleAutoCancel(job) {
        const { orderId } = job.data;
        this.logger.log(`Processing auto-cancel for order: ${orderId}`);
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order)
            return;
        if (order.status === order_status_enum_1.OrderStatus.PENDING) {
            order.status = order_status_enum_1.OrderStatus.CANCELLED;
            order.adminNotes = 'Auto-cancelled: payment not received within timeout period';
            await this.orderRepo.save(order);
            this.logger.log(`Order ${order.orderNumber} auto-cancelled due to payment timeout`);
        }
    }
    async handleDeliveryReminder(job) {
        const { orderId, userEmail } = job.data;
        this.logger.log(`Processing delivery reminder for order: ${orderId} to ${userEmail}`);
        const order = await this.orderRepo.findOne({ where: { id: orderId } });
        if (!order) {
            this.logger.warn(`Delivery reminder skipped — order ${orderId} not found`);
            return;
        }
        if (order.status === order_status_enum_1.OrderStatus.CANCELLED) {
            this.logger.log(`Delivery reminder skipped — order ${order.orderNumber} was cancelled`);
            return;
        }
        const user = await this.userRepo.findOne({ where: { id: order.userId } });
        await this.notificationsService.sendDeliveryReminder(userEmail, {
            customerName: user?.fullName ?? 'there',
            orderNumber: order.orderNumber,
            deliveryDate: order.deliveryDate ? order.deliveryDate.toDateString() : 'soon',
            deliveryTimeSlot: order.deliveryTimeSlot,
        });
    }
};
exports.OrderProcessor = OrderProcessor;
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_ORDER_AUTO_CANCEL),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderProcessor.prototype, "handleAutoCancel", null);
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_ORDER_DELIVERY_REMINDER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderProcessor.prototype, "handleDeliveryReminder", null);
exports.OrderProcessor = OrderProcessor = OrderProcessor_1 = __decorate([
    (0, bull_1.Processor)(queue_constants_1.QUEUE_ORDER),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], OrderProcessor);
//# sourceMappingURL=order.processor.js.map