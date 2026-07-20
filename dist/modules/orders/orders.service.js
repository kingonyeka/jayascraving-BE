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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const user_entity_1 = require("../users/entities/user.entity");
const order_status_enum_1 = require("../../common/enums/order-status.enum");
const cart_service_1 = require("../cart/cart.service");
const queues_service_1 = require("../queues/queues.service");
const staff_service_1 = require("../staff/staff.service");
const promotions_service_1 = require("../promotions/promotions.service");
const notifications_service_1 = require("../notifications/notifications.service");
const abandoned_cart_service_1 = require("../abandoned-cart/abandoned-cart.service");
const real_time_analytics_service_1 = require("../real-time-analytics/real-time-analytics.service");
const in_app_notifications_service_1 = require("../in-app-notifications/in-app-notifications.service");
const push_notifications_service_1 = require("../push-notifications/push-notifications.service");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
let OrdersService = class OrdersService {
    constructor(orderRepo, orderItemRepo, userRepo, cartService, queuesService, staffService, promotionsService, notificationsService, abandonedCartService, realTimeAnalyticsService, inAppNotificationsService, pushNotificationsService, configService, dataSource) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.userRepo = userRepo;
        this.cartService = cartService;
        this.queuesService = queuesService;
        this.staffService = staffService;
        this.promotionsService = promotionsService;
        this.notificationsService = notificationsService;
        this.abandonedCartService = abandonedCartService;
        this.realTimeAnalyticsService = realTimeAnalyticsService;
        this.inAppNotificationsService = inAppNotificationsService;
        this.pushNotificationsService = pushNotificationsService;
        this.configService = configService;
        this.dataSource = dataSource;
    }
    async generateOrderNumber() {
        const [{ nextval }] = await this.orderRepo.query(`SELECT nextval('order_number_seq') as nextval`);
        return `JC-${String(nextval).padStart(6, '0')}`;
    }
    async createFromCart(userId, input) {
        const cart = await this.cartService.getOrCreateCart(userId);
        if (!cart.items?.length)
            throw new common_1.BadRequestException('Your cart is empty');
        if (input.deliveryType === order_entity_1.DeliveryType.DELIVERY &&
            (!input.deliveryStreet || !input.deliveryCity || !input.deliveryState)) {
            throw new common_1.BadRequestException('Delivery address is required for delivery orders');
        }
        const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
        const deliveryFee = input.deliveryType === order_entity_1.DeliveryType.DELIVERY ? 2000 : 0;
        const savedOrder = await this.dataSource.transaction(async (manager) => {
            let discount;
            let promoCodeId;
            const orderNumber = await this.generateOrderNumber();
            const order = manager.create(order_entity_1.Order, {
                orderNumber, userId,
                status: order_status_enum_1.OrderStatus.PENDING,
                deliveryType: input.deliveryType,
                subtotal, deliveryFee, discount: 0, total: subtotal + deliveryFee,
                promoCode: input.promoCode,
                deliveryAddressId: input.deliveryAddressId,
                deliveryRecipientName: input.deliveryRecipientName,
                deliveryPhone: input.deliveryPhone,
                deliveryStreet: input.deliveryStreet,
                deliveryCity: input.deliveryCity,
                deliveryState: input.deliveryState,
                deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
                deliveryTimeSlot: input.deliveryTimeSlot,
                notes: input.notes,
            });
            let saved = await manager.save(order_entity_1.Order, order);
            if (input.promoCode) {
                const promoResult = await this.promotionsService.applyAndRecordUsage(manager, input.promoCode, userId, saved.id, subtotal, deliveryFee);
                discount = promoResult.discountAmount;
                promoCodeId = promoResult.promoCode.id;
                saved.discount = discount;
                saved.total = Math.max(0, subtotal + deliveryFee - discount);
                saved.promoCodeId = promoCodeId;
                saved = await manager.save(order_entity_1.Order, saved);
            }
            const orderItems = cart.items.map((cartItem) => manager.create(order_item_entity_1.OrderItem, {
                orderId: saved.id,
                productId: cartItem.productId,
                productName: cartItem.productName,
                unitPrice: cartItem.unitPrice,
                quantity: cartItem.quantity,
                totalPrice: Number(cartItem.unitPrice) * cartItem.quantity,
                variantId: cartItem.variantId,
                variantName: cartItem.variantName,
                customisations: cartItem.customisations,
                specialInstructions: cartItem.specialInstructions,
            }));
            await manager.save(order_item_entity_1.OrderItem, orderItems);
            return saved;
        });
        await this.cartService.clearCart(userId);
        await this.abandonedCartService.cancelRecovery(cart.id);
        await this.queuesService.scheduleAutoCancel(savedOrder.id, 30 * 60 * 1000);
        if (savedOrder.deliveryDate) {
            const reminderTime = new Date(savedOrder.deliveryDate);
            reminderTime.setDate(reminderTime.getDate() - 1);
            const delay = reminderTime.getTime() - Date.now();
            if (delay > 0) {
                await this.queuesService.scheduleDeliveryReminder(savedOrder.id, userId, delay);
            }
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user) {
            await this.notificationsService.sendOrderConfirmation(user.email, {
                customerName: user.fullName,
                orderNumber: savedOrder.orderNumber,
                orderItems: cart.items.map((i) => ({
                    name: i.productName,
                    quantity: i.quantity,
                    price: Number(i.unitPrice),
                })),
                subtotal,
                deliveryFee,
                discount: savedOrder.discount,
                total: savedOrder.total,
                deliveryType: savedOrder.deliveryType,
            });
        }
        this.realTimeAnalyticsService.emitNewOrder({
            id: savedOrder.id,
            orderNumber: savedOrder.orderNumber,
            total: savedOrder.total,
            userId,
        });
        return this.findById(savedOrder.id);
    }
    async findById(id) {
        const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async findByOrderNumber(orderNumber) {
        const order = await this.orderRepo.findOne({ where: { orderNumber }, relations: ['items'] });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async findByUser(userId, pagination = new pagination_type_1.PaginationInput()) {
        const [data, total] = await this.orderRepo.findAndCount({
            where: { userId },
            relations: ['items'],
            order: { createdAt: 'DESC' },
            skip: pagination.skip,
            take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findAll(filter = {}, pagination = new pagination_type_1.PaginationInput()) {
        const qb = this.orderRepo.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .orderBy('order.createdAt', 'DESC');
        if (filter.status)
            qb.andWhere('order.status = :status', { status: filter.status });
        if (filter.deliveryType)
            qb.andWhere('order.deliveryType = :deliveryType', { deliveryType: filter.deliveryType });
        if (filter.userId)
            qb.andWhere('order.userId = :userId', { userId: filter.userId });
        if (filter.search)
            qb.andWhere('order.orderNumber ILIKE :search', { search: `%${filter.search}%` });
        if (filter.fromDate)
            qb.andWhere('order.createdAt >= :fromDate', { fromDate: new Date(filter.fromDate) });
        if (filter.toDate)
            qb.andWhere('order.createdAt <= :toDate', { toDate: new Date(filter.toDate) });
        qb.skip(pagination.skip).take(pagination.limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async updateStatus(input, adminId, adminName) {
        const order = await this.findById(input.orderId);
        const before = { status: order.status };
        order.status = input.status;
        if (input.adminNotes)
            order.adminNotes = input.adminNotes;
        const saved = await this.orderRepo.save(order);
        if (input.status === order_status_enum_1.OrderStatus.CONFIRMED && before.status === order_status_enum_1.OrderStatus.PENDING) {
            await this.queuesService.cancelAutoCancel(order.id);
        }
        await this.staffService.logAction(adminId, adminName, 'UPDATE_ORDER_STATUS', 'Order', order.id, before, { status: input.status, adminNotes: input.adminNotes });
        if (before.status !== saved.status) {
            const user = await this.userRepo.findOne({ where: { id: saved.userId } });
            if (user) {
                await this.notificationsService.sendOrderStatusUpdate(user.email, {
                    customerName: user.fullName,
                    orderNumber: saved.orderNumber,
                    status: saved.status,
                });
                await this.inAppNotificationsService.notifyOrderStatus(user.id, saved.orderNumber, saved.id, saved.status);
                if (user.fcmToken) {
                    await this.pushNotificationsService.notifyOrderStatus(user.fcmToken, saved.orderNumber, saved.status, saved.id);
                }
            }
            this.realTimeAnalyticsService.emitOrderStatusChanged({
                id: saved.id,
                orderNumber: saved.orderNumber,
                status: saved.status,
            });
        }
        return saved;
    }
    async cancel(orderId, userId) {
        const order = await this.findById(orderId);
        if (order.userId !== userId)
            throw new common_1.BadRequestException('You can only cancel your own orders');
        const cancellableStatuses = [order_status_enum_1.OrderStatus.PENDING, order_status_enum_1.OrderStatus.CONFIRMED];
        if (!cancellableStatuses.includes(order.status)) {
            throw new common_1.BadRequestException(`Order cannot be cancelled at status: ${order.status}`);
        }
        order.status = order_status_enum_1.OrderStatus.CANCELLED;
        const saved = await this.orderRepo.save(order);
        await this.queuesService.cancelAutoCancel(orderId);
        return saved;
    }
    async reorder(orderId, userId) {
        const originalOrder = await this.findById(orderId);
        if (originalOrder.userId !== userId)
            throw new common_1.BadRequestException('Order not found');
        for (const item of originalOrder.items) {
            await this.cartService.addItem(userId, undefined, item.productId, item.quantity, item.variantId, item.customisations, item.specialInstructions);
        }
        return this.createFromCart(userId, {
            deliveryType: originalOrder.deliveryType,
            deliveryAddressId: originalOrder.deliveryAddressId,
            deliveryRecipientName: originalOrder.deliveryRecipientName,
            deliveryPhone: originalOrder.deliveryPhone,
            deliveryStreet: originalOrder.deliveryStreet,
            deliveryCity: originalOrder.deliveryCity,
            deliveryState: originalOrder.deliveryState,
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cart_service_1.CartService,
        queues_service_1.QueuesService,
        staff_service_1.StaffService,
        promotions_service_1.PromotionsService,
        notifications_service_1.NotificationsService,
        abandoned_cart_service_1.AbandonedCartService,
        real_time_analytics_service_1.RealTimeAnalyticsService,
        in_app_notifications_service_1.InAppNotificationsService,
        push_notifications_service_1.PushNotificationsService,
        config_1.ConfigService,
        typeorm_2.DataSource])
], OrdersService);
//# sourceMappingURL=orders.service.js.map