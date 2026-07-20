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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const user_entity_1 = require("../users/entities/user.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const cart_entity_1 = require("../cart/entities/cart.entity");
const order_status_enum_1 = require("../../common/enums/order-status.enum");
const payment_status_enum_1 = require("../../common/enums/payment-status.enum");
let AnalyticsService = class AnalyticsService {
    constructor(orderRepo, orderItemRepo, userRepo, paymentRepo, cartRepo) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.userRepo = userRepo;
        this.paymentRepo = paymentRepo;
        this.cartRepo = cartRepo;
    }
    async getRevenueOverview(from, to) {
        const result = await this.paymentRepo
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .addSelect('COUNT(payment.id)', 'count')
            .where('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.SUCCESS })
            .andWhere('payment.paidAt BETWEEN :from AND :to', { from, to })
            .getRawOne();
        return {
            totalRevenue: Number(result?.total ?? 0),
            totalTransactions: Number(result?.count ?? 0),
        };
    }
    async getRevenueByPeriod(period, from, to) {
        const trunc = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month';
        const results = await this.paymentRepo
            .createQueryBuilder('payment')
            .select(`DATE_TRUNC('${trunc}', payment.paidAt)`, 'period')
            .addSelect('SUM(payment.amount)', 'revenue')
            .addSelect('COUNT(payment.id)', 'transactions')
            .where('payment.status = :status', { status: payment_status_enum_1.PaymentStatus.SUCCESS })
            .andWhere('payment.paidAt BETWEEN :from AND :to', { from, to })
            .groupBy(`DATE_TRUNC('${trunc}', payment.paidAt)`)
            .orderBy(`DATE_TRUNC('${trunc}', payment.paidAt)`, 'ASC')
            .getRawMany();
        return results.map((r) => ({
            period: r.period,
            revenue: Number(r.revenue),
            transactions: Number(r.transactions),
        }));
    }
    async getOrderStats(from, to) {
        const total = await this.orderRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(from, to) },
        });
        const byStatus = await this.orderRepo
            .createQueryBuilder('order')
            .select('order.status', 'status')
            .addSelect('COUNT(order.id)', 'count')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('order.status')
            .getRawMany();
        const delivered = byStatus.find((s) => s.status === order_status_enum_1.OrderStatus.DELIVERED);
        const cancelled = byStatus.find((s) => s.status === order_status_enum_1.OrderStatus.CANCELLED);
        const fulfilmentRate = total > 0
            ? Math.round((Number(delivered?.count ?? 0) / total) * 100)
            : 0;
        const avgOrderValue = await this.orderRepo
            .createQueryBuilder('order')
            .select('AVG(order.total)', 'avg')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .getRawOne();
        return {
            totalOrders: total,
            byStatus: byStatus.map((s) => ({
                status: s.status,
                count: Number(s.count),
            })),
            fulfilmentRate,
            cancelledOrders: Number(cancelled?.count ?? 0),
            averageOrderValue: Math.round(Number(avgOrderValue?.avg ?? 0)),
        };
    }
    async getTopProducts(from, to, limit = 10) {
        return this.orderItemRepo
            .createQueryBuilder('item')
            .innerJoin('item.order', 'order')
            .select('item.productId', 'productId')
            .addSelect('item.productName', 'productName')
            .addSelect('SUM(item.quantity)', 'totalSold')
            .addSelect('SUM(item.totalPrice)', 'totalRevenue')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .andWhere('order.status != :cancelled', { cancelled: order_status_enum_1.OrderStatus.CANCELLED })
            .groupBy('item.productId')
            .addGroupBy('item.productName')
            .orderBy('SUM(item.quantity)', 'DESC')
            .limit(limit)
            .getRawMany();
    }
    async getCustomerStats(from, to) {
        const totalCustomers = await this.userRepo.count();
        const newCustomers = await this.userRepo.count({
            where: { createdAt: (0, typeorm_2.Between)(from, to) },
        });
        const returningCustomers = await this.orderRepo
            .createQueryBuilder('order')
            .select('order.userId', 'userId')
            .where('order.createdAt BETWEEN :from AND :to', { from, to })
            .groupBy('order.userId')
            .having('COUNT(order.id) > 1')
            .getCount();
        return {
            totalCustomers,
            newCustomers,
            returningCustomers,
        };
    }
    async getAbandonedCartCount() {
        const result = await this.cartRepo
            .createQueryBuilder('cart')
            .innerJoin('cart.items', 'items')
            .where('cart.userId IS NOT NULL')
            .getCount();
        return result;
    }
    async getDashboardSummary(from, to) {
        const [revenue, orders, customers, abandonedCarts, topProducts] = await Promise.all([
            this.getRevenueOverview(from, to),
            this.getOrderStats(from, to),
            this.getCustomerStats(from, to),
            this.getAbandonedCartCount(),
            this.getTopProducts(from, to, 5),
        ]);
        return {
            revenue,
            orders,
            customers,
            abandonedCarts,
            topProducts,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(4, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map