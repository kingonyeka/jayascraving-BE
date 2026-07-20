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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
let InAppNotificationsService = class InAppNotificationsService {
    constructor(notificationRepo) {
        this.notificationRepo = notificationRepo;
    }
    async create(userId, type, title, body, options) {
        const notification = this.notificationRepo.create({
            userId,
            type,
            title,
            body,
            ...options,
            isRead: false,
        });
        return this.notificationRepo.save(notification);
    }
    async getForUser(userId, pagination = new pagination_type_1.PaginationInput()) {
        const [data, total] = await this.notificationRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: pagination.skip,
            take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async getUnreadCount(userId) {
        return this.notificationRepo.count({
            where: { userId, isRead: false },
        });
    }
    async markAsRead(notificationId, userId) {
        const notification = await this.notificationRepo.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        notification.isRead = true;
        notification.readAt = new Date();
        return this.notificationRepo.save(notification);
    }
    async markAllAsRead(userId) {
        const result = await this.notificationRepo.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
        return result.affected ?? 0;
    }
    async delete(notificationId, userId) {
        const notification = await this.notificationRepo.findOne({
            where: { id: notificationId, userId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        await this.notificationRepo.remove(notification);
        return true;
    }
    async clearRead(userId) {
        const result = await this.notificationRepo.delete({ userId, isRead: true });
        return result.affected ?? 0;
    }
    async notifyOrderStatus(userId, orderNumber, orderId, status) {
        const messages = {
            CONFIRMED: { title: '✅ Order Confirmed', body: `Your order ${orderNumber} has been confirmed and is being prepared.` },
            BAKING: { title: '🔥 Baking in Progress', body: `Your cake for order ${orderNumber} is in the oven!` },
            READY: { title: '🎂 Order Ready!', body: `Your order ${orderNumber} is ready.` },
            OUT_FOR_DELIVERY: { title: '🚗 Out for Delivery', body: `Your order ${orderNumber} is on its way!` },
            DELIVERED: { title: '🎉 Delivered!', body: `Your order ${orderNumber} has been delivered. Enjoy every bite!` },
            CANCELLED: { title: '❌ Order Cancelled', body: `Your order ${orderNumber} has been cancelled.` },
        };
        const msg = messages[status];
        if (!msg)
            return;
        await this.create(userId, notification_entity_1.NotificationType.ORDER_STATUS, msg.title, msg.body, {
            referenceId: orderId,
            referenceType: 'Order',
            actionUrl: `/orders/${orderId}`,
        });
    }
    async notifyPaymentSuccess(userId, orderNumber, orderId, amount) {
        await this.create(userId, notification_entity_1.NotificationType.PAYMENT_SUCCESS, '💳 Payment Successful', `₦${amount.toLocaleString()} received for order ${orderNumber}.`, { referenceId: orderId, referenceType: 'Order', actionUrl: `/orders/${orderId}` });
    }
    async notifyCustomOrderQuote(userId, requestNumber, requestId) {
        await this.create(userId, notification_entity_1.NotificationType.CUSTOM_ORDER_QUOTE, '📋 Quote Ready', `Your quote for request ${requestNumber} is ready. Tap to review and respond.`, { referenceId: requestId, referenceType: 'CustomOrder', actionUrl: `/custom-orders/${requestId}` });
    }
    async notifyPromotion(userIds, title, body) {
        const notifications = userIds.map((userId) => this.notificationRepo.create({
            userId,
            type: notification_entity_1.NotificationType.PROMOTION,
            title,
            body,
            actionUrl: '/shop',
            isRead: false,
        }));
        await this.notificationRepo.save(notifications);
    }
};
exports.InAppNotificationsService = InAppNotificationsService;
exports.InAppNotificationsService = InAppNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InAppNotificationsService);
//# sourceMappingURL=in-app-notifications.service.js.map