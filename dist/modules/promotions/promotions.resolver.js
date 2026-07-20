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
exports.PromotionsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const promotions_service_1 = require("./promotions.service");
const promo_code_entity_1 = require("./entities/promo-code.entity");
const promo_usage_entity_1 = require("./entities/promo-usage.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const graphql_2 = require("@nestjs/graphql");
let PromoValidationResult = class PromoValidationResult {
};
__decorate([
    (0, graphql_2.Field)(() => promo_code_entity_1.PromoCode),
    __metadata("design:type", promo_code_entity_1.PromoCode)
], PromoValidationResult.prototype, "promoCode", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PromoValidationResult.prototype, "discountAmount", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], PromoValidationResult.prototype, "finalTotal", void 0);
PromoValidationResult = __decorate([
    (0, graphql_2.ObjectType)()
], PromoValidationResult);
let BroadcastPromotionResult = class BroadcastPromotionResult {
};
__decorate([
    (0, graphql_2.Field)(() => promo_code_entity_1.PromoCode),
    __metadata("design:type", promo_code_entity_1.PromoCode)
], BroadcastPromotionResult.prototype, "promoCode", void 0);
__decorate([
    (0, graphql_2.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], BroadcastPromotionResult.prototype, "notifiedCount", void 0);
BroadcastPromotionResult = __decorate([
    (0, graphql_2.ObjectType)()
], BroadcastPromotionResult);
let PromotionsResolver = class PromotionsResolver {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
    }
    async validatePromoCode(user, code, orderSubtotal, deliveryFee) {
        return this.promotionsService.applyPromoCode(code, user.id, orderSubtotal, deliveryFee);
    }
    promoCodes() {
        return this.promotionsService.findAll();
    }
    promoCode(id) {
        return this.promotionsService.findById(id);
    }
    promoUsageHistory(promoCodeId) {
        return this.promotionsService.getUsageHistory(promoCodeId);
    }
    createPromoCode(user, code, discountType, discountValue, description, minimumOrderValue, maximumDiscount, usageLimit, perUserLimit, startsAt, expiresAt) {
        return this.promotionsService.create({
            code,
            discountType,
            discountValue,
            description,
            minimumOrderValue,
            maximumDiscount,
            usageLimit,
            perUserLimit,
            startsAt: startsAt ? new Date(startsAt) : undefined,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        }, user.id);
    }
    togglePromoCode(id) {
        return this.promotionsService.toggleActive(id);
    }
    deletePromoCode(id) {
        return this.promotionsService.delete(id);
    }
    broadcastPromoCode(promoCodeId, title, body) {
        return this.promotionsService.broadcastPromotion(promoCodeId, title, body);
    }
};
exports.PromotionsResolver = PromotionsResolver;
__decorate([
    (0, graphql_1.Query)(() => PromoValidationResult, { description: 'Validate and preview a promo code discount' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('code')),
    __param(2, (0, graphql_1.Args)('orderSubtotal', { type: () => graphql_1.Float })),
    __param(3, (0, graphql_1.Args)('deliveryFee', { type: () => graphql_1.Float, defaultValue: 0 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Number, Number]),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "validatePromoCode", null);
__decorate([
    (0, graphql_1.Query)(() => [promo_code_entity_1.PromoCode], { description: 'Admin: get all promo codes' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "promoCodes", null);
__decorate([
    (0, graphql_1.Query)(() => promo_code_entity_1.PromoCode, { description: 'Admin: get a promo code by ID' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "promoCode", null);
__decorate([
    (0, graphql_1.Query)(() => [promo_usage_entity_1.PromoUsage], { description: 'Admin: get usage history for a promo code' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('promoCodeId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "promoUsageHistory", null);
__decorate([
    (0, graphql_1.Mutation)(() => promo_code_entity_1.PromoCode, { description: 'Admin: create a promo code' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('code')),
    __param(2, (0, graphql_1.Args)('discountType', { type: () => promo_code_entity_1.DiscountType })),
    __param(3, (0, graphql_1.Args)('discountValue', { type: () => graphql_1.Float })),
    __param(4, (0, graphql_1.Args)('description', { nullable: true })),
    __param(5, (0, graphql_1.Args)('minimumOrderValue', { type: () => graphql_1.Float, nullable: true })),
    __param(6, (0, graphql_1.Args)('maximumDiscount', { type: () => graphql_1.Float, nullable: true })),
    __param(7, (0, graphql_1.Args)('usageLimit', { type: () => graphql_1.Int, nullable: true })),
    __param(8, (0, graphql_1.Args)('perUserLimit', { type: () => graphql_1.Int, nullable: true })),
    __param(9, (0, graphql_1.Args)('startsAt', { nullable: true })),
    __param(10, (0, graphql_1.Args)('expiresAt', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String, Number, String, Number, Number, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "createPromoCode", null);
__decorate([
    (0, graphql_1.Mutation)(() => promo_code_entity_1.PromoCode, { description: 'Admin: toggle promo code active status' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "togglePromoCode", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: delete a promo code' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "deletePromoCode", null);
__decorate([
    (0, graphql_1.Mutation)(() => BroadcastPromotionResult, {
        description: 'Admin: announce an active promo code to all customers (in-app + push)',
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('promoCodeId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('title')),
    __param(2, (0, graphql_1.Args)('body')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PromotionsResolver.prototype, "broadcastPromoCode", null);
exports.PromotionsResolver = PromotionsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], PromotionsResolver);
//# sourceMappingURL=promotions.resolver.js.map