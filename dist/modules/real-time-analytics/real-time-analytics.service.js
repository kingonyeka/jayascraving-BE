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
var RealTimeAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rxjs_1 = require("rxjs");
const order_entity_1 = require("../orders/entities/order.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const payment_status_enum_1 = require("../../common/enums/payment-status.enum");
const order_status_enum_1 = require("../../common/enums/order-status.enum");
let RealTimeAnalyticsService = RealTimeAnalyticsService_1 = class RealTimeAnalyticsService {
    constructor(orderRepo, paymentRepo, userRepo) {
        this.orderRepo = orderRepo;
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(RealTimeAnalyticsService_1.name);
        this.eventSubject = new rxjs_1.Subject();
    }
    getEventStream() {
        return this.eventSubject.asObservable();
    }
    emitNewOrder(order) {
        this.emit({
            type: 'NEW_ORDER',
            payload: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                total: order.total,
                userId: order.userId,
            },
        });
    }
    emitOrderStatusChanged(order) {
        this.emit({
            type: 'ORDER_STATUS_CHANGED',
            payload: {
                orderId: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
            },
        });
    }
    emitPaymentReceived(payment) {
        this.emit({
            type: 'PAYMENT_RECEIVED',
            payload: {
                paymentId: payment.id,
                amount: payment.amount,
                orderId: payment.orderId,
            },
        });
    }
    emitNewCustomer(user) {
        this.emit({
            type: 'NEW_CUSTOMER',
            payload: { userId: user.id, email: user.email },
        });
    }
    async getLiveDashboardSnapshot() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [todayOrders, todayRevenue, pendingOrders, totalCustomers,] = await Promise.all([
            this.orderRepo.count({ where: { createdAt: today } }),
            this.paymentRepo
                .createQueryBuilder('p')
                .select('SUM(p.amount)', 'total')
                .where('p.status = :status', { status: payment_status_enum_1.PaymentStatus.SUCCESS })
                .andWhere('p.paidAt >= :today', { today })
                .getRawOne(),
            this.orderRepo.count({ where: { status: order_status_enum_1.OrderStatus.PENDING } }),
            this.userRepo.count(),
        ]);
        return {
            todayOrders,
            todayRevenue: Number(todayRevenue?.total ?? 0),
            pendingOrders,
            totalCustomers,
            timestamp: new Date().toISOString(),
        };
    }
    emit(event) {
        const fullEvent = {
            ...event,
            timestamp: new Date().toISOString(),
        };
        this.eventSubject.next(fullEvent);
        this.logger.debug(`SSE event emitted: ${event.type}`);
    }
};
exports.RealTimeAnalyticsService = RealTimeAnalyticsService;
exports.RealTimeAnalyticsService = RealTimeAnalyticsService = RealTimeAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RealTimeAnalyticsService);
//# sourceMappingURL=real-time-analytics.service.js.map