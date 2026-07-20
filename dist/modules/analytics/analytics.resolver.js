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
exports.AnalyticsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("./analytics.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let RevenueOverview = class RevenueOverview {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], RevenueOverview.prototype, "totalRevenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RevenueOverview.prototype, "totalTransactions", void 0);
RevenueOverview = __decorate([
    (0, graphql_1.ObjectType)()
], RevenueOverview);
let RevenuePeriod = class RevenuePeriod {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RevenuePeriod.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], RevenuePeriod.prototype, "revenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RevenuePeriod.prototype, "transactions", void 0);
RevenuePeriod = __decorate([
    (0, graphql_1.ObjectType)()
], RevenuePeriod);
let OrderStatusCount = class OrderStatusCount {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderStatusCount.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStatusCount.prototype, "count", void 0);
OrderStatusCount = __decorate([
    (0, graphql_1.ObjectType)()
], OrderStatusCount);
let OrderStats = class OrderStats {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "totalOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OrderStatusCount]),
    __metadata("design:type", Array)
], OrderStats.prototype, "byStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "fulfilmentRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], OrderStats.prototype, "cancelledOrders", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], OrderStats.prototype, "averageOrderValue", void 0);
OrderStats = __decorate([
    (0, graphql_1.ObjectType)()
], OrderStats);
let TopProduct = class TopProduct {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TopProduct.prototype, "productId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], TopProduct.prototype, "productName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], TopProduct.prototype, "totalSold", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TopProduct.prototype, "totalRevenue", void 0);
TopProduct = __decorate([
    (0, graphql_1.ObjectType)()
], TopProduct);
let CustomerStats = class CustomerStats {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CustomerStats.prototype, "totalCustomers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CustomerStats.prototype, "newCustomers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CustomerStats.prototype, "returningCustomers", void 0);
CustomerStats = __decorate([
    (0, graphql_1.ObjectType)()
], CustomerStats);
let DashboardSummary = class DashboardSummary {
};
__decorate([
    (0, graphql_1.Field)(() => RevenueOverview),
    __metadata("design:type", RevenueOverview)
], DashboardSummary.prototype, "revenue", void 0);
__decorate([
    (0, graphql_1.Field)(() => OrderStats),
    __metadata("design:type", OrderStats)
], DashboardSummary.prototype, "orders", void 0);
__decorate([
    (0, graphql_1.Field)(() => CustomerStats),
    __metadata("design:type", CustomerStats)
], DashboardSummary.prototype, "customers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DashboardSummary.prototype, "abandonedCarts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [TopProduct]),
    __metadata("design:type", Array)
], DashboardSummary.prototype, "topProducts", void 0);
DashboardSummary = __decorate([
    (0, graphql_1.ObjectType)()
], DashboardSummary);
let AnalyticsResolver = class AnalyticsResolver {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async dashboardSummary(from, to) {
        return this.analyticsService.getDashboardSummary(new Date(from), new Date(to));
    }
    async revenueOverview(from, to) {
        return this.analyticsService.getRevenueOverview(new Date(from), new Date(to));
    }
    async revenueByPeriod(period, from, to) {
        return this.analyticsService.getRevenueByPeriod(period, new Date(from), new Date(to));
    }
    async orderStats(from, to) {
        return this.analyticsService.getOrderStats(new Date(from), new Date(to));
    }
    async topProducts(from, to, limit) {
        return this.analyticsService.getTopProducts(new Date(from), new Date(to), limit);
    }
    async customerStats(from, to) {
        return this.analyticsService.getCustomerStats(new Date(from), new Date(to));
    }
    async abandonedCarts() {
        return this.analyticsService.getAbandonedCartCount();
    }
};
exports.AnalyticsResolver = AnalyticsResolver;
__decorate([
    (0, graphql_1.Query)(() => DashboardSummary, { description: 'Admin: get full dashboard summary' }),
    __param(0, (0, graphql_1.Args)('from')),
    __param(1, (0, graphql_1.Args)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "dashboardSummary", null);
__decorate([
    (0, graphql_1.Query)(() => RevenueOverview, { description: 'Admin: get revenue overview for a date range' }),
    __param(0, (0, graphql_1.Args)('from')),
    __param(1, (0, graphql_1.Args)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "revenueOverview", null);
__decorate([
    (0, graphql_1.Query)(() => [RevenuePeriod], { description: 'Admin: get revenue broken down by period (daily/weekly/monthly)' }),
    __param(0, (0, graphql_1.Args)('period')),
    __param(1, (0, graphql_1.Args)('from')),
    __param(2, (0, graphql_1.Args)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "revenueByPeriod", null);
__decorate([
    (0, graphql_1.Query)(() => OrderStats, { description: 'Admin: get order statistics for a date range' }),
    __param(0, (0, graphql_1.Args)('from')),
    __param(1, (0, graphql_1.Args)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "orderStats", null);
__decorate([
    (0, graphql_1.Query)(() => [TopProduct], { description: 'Admin: get top selling products' }),
    __param(0, (0, graphql_1.Args)('from')),
    __param(1, (0, graphql_1.Args)('to')),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "topProducts", null);
__decorate([
    (0, graphql_1.Query)(() => CustomerStats, { description: 'Admin: get customer acquisition stats' }),
    __param(0, (0, graphql_1.Args)('from')),
    __param(1, (0, graphql_1.Args)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "customerStats", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int, { description: 'Admin: get abandoned cart count' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsResolver.prototype, "abandonedCarts", null);
exports.AnalyticsResolver = AnalyticsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsResolver);
//# sourceMappingURL=analytics.resolver.js.map