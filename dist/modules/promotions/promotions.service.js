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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promo_code_entity_1 = require("./entities/promo-code.entity");
const promo_usage_entity_1 = require("./entities/promo-usage.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const in_app_notifications_service_1 = require("../in-app-notifications/in-app-notifications.service");
const push_notifications_service_1 = require("../push-notifications/push-notifications.service");
let PromotionsService = class PromotionsService {
    constructor(promoRepo, usageRepo, userRepo, inAppNotificationsService, pushNotificationsService) {
        this.promoRepo = promoRepo;
        this.usageRepo = usageRepo;
        this.userRepo = userRepo;
        this.inAppNotificationsService = inAppNotificationsService;
        this.pushNotificationsService = pushNotificationsService;
    }
    async applyPromoCode(code, userId, orderSubtotal, deliveryFee) {
        const promo = await this.promoRepo.findOne({
            where: { code: code.toUpperCase(), isActive: true },
        });
        return this.validateAndCalculate(promo, code, userId, orderSubtotal, deliveryFee);
    }
    async applyAndRecordUsage(manager, code, userId, orderId, orderSubtotal, deliveryFee) {
        const promo = await manager.findOne(promo_code_entity_1.PromoCode, {
            where: { code: code.toUpperCase(), isActive: true },
            lock: { mode: 'pessimistic_write' },
        });
        const result = await this.validateAndCalculate(promo, code, userId, orderSubtotal, deliveryFee, manager);
        await manager.save(promo_usage_entity_1.PromoUsage, manager.create(promo_usage_entity_1.PromoUsage, {
            promoCodeId: result.promoCode.id,
            userId,
            orderId,
            discountApplied: result.discountAmount,
        }));
        await manager.increment(promo_code_entity_1.PromoCode, { id: result.promoCode.id }, 'usageCount', 1);
        return result;
    }
    async validateAndCalculate(promo, code, userId, orderSubtotal, deliveryFee, manager) {
        if (!promo)
            throw new common_1.NotFoundException('Invalid or inactive promo code');
        const now = new Date();
        if (promo.startsAt && promo.startsAt > now) {
            throw new common_1.BadRequestException('This promo code is not yet active');
        }
        if (promo.expiresAt && promo.expiresAt < now) {
            throw new common_1.BadRequestException('This promo code has expired');
        }
        if (promo.usageLimit !== null && promo.usageLimit !== undefined) {
            if (promo.usageCount >= promo.usageLimit) {
                throw new common_1.BadRequestException('This promo code has reached its usage limit');
            }
        }
        if (promo.perUserLimit !== null && promo.perUserLimit !== undefined) {
            const usageRepository = manager ? manager.getRepository(promo_usage_entity_1.PromoUsage) : this.usageRepo;
            const userUsageCount = await usageRepository.count({
                where: { promoCodeId: promo.id, userId },
            });
            if (userUsageCount >= promo.perUserLimit) {
                throw new common_1.BadRequestException('You have already used this promo code the maximum number of times');
            }
        }
        if (promo.minimumOrderValue && orderSubtotal < promo.minimumOrderValue) {
            throw new common_1.BadRequestException(`Minimum order value of ₦${promo.minimumOrderValue.toLocaleString()} required for this promo code`);
        }
        let discountAmount = 0;
        switch (promo.discountType) {
            case promo_code_entity_1.DiscountType.PERCENTAGE:
                discountAmount = (orderSubtotal * Number(promo.discountValue)) / 100;
                if (promo.maximumDiscount) {
                    discountAmount = Math.min(discountAmount, Number(promo.maximumDiscount));
                }
                break;
            case promo_code_entity_1.DiscountType.FIXED:
                discountAmount = Math.min(Number(promo.discountValue), orderSubtotal);
                break;
            case promo_code_entity_1.DiscountType.FREE_DELIVERY:
                discountAmount = deliveryFee;
                break;
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
        const finalTotal = Math.max(0, orderSubtotal + deliveryFee - discountAmount);
        return { promoCode: promo, discountAmount, finalTotal };
    }
    async create(data, adminUserId) {
        const exists = await this.promoRepo.findOne({
            where: { code: data.code?.toUpperCase() },
        });
        if (exists)
            throw new common_1.ConflictException('A promo code with this code already exists');
        const promo = this.promoRepo.create({
            ...data,
            code: data.code?.toUpperCase(),
            createdBy: adminUserId,
        });
        return this.promoRepo.save(promo);
    }
    async update(id, data) {
        const promo = await this.findById(id);
        Object.assign(promo, data);
        return this.promoRepo.save(promo);
    }
    async delete(id) {
        const promo = await this.findById(id);
        await this.promoRepo.remove(promo);
        return true;
    }
    async findById(id) {
        const promo = await this.promoRepo.findOne({ where: { id } });
        if (!promo)
            throw new common_1.NotFoundException('Promo code not found');
        return promo;
    }
    async findAll() {
        return this.promoRepo.find({ order: { createdAt: 'DESC' } });
    }
    async getUsageHistory(promoCodeId) {
        return this.usageRepo.find({
            where: { promoCodeId },
            order: { createdAt: 'DESC' },
        });
    }
    async toggleActive(id) {
        const promo = await this.findById(id);
        promo.isActive = !promo.isActive;
        return this.promoRepo.save(promo);
    }
    async broadcastPromotion(promoCodeId, title, body) {
        const promo = await this.findById(promoCodeId);
        if (!promo.isActive) {
            throw new common_1.BadRequestException('Cannot broadcast an inactive promo code — activate it first');
        }
        const customers = await this.userRepo.find({
            where: { role: user_role_enum_1.UserRole.CUSTOMER, isActive: true },
            select: ['id'],
        });
        const userIds = customers.map((c) => c.id);
        if (userIds.length > 0) {
            await this.inAppNotificationsService.notifyPromotion(userIds, title, body);
        }
        await this.pushNotificationsService.broadcastPromotion(title, body, promo.code);
        return { promoCode: promo, notifiedCount: userIds.length };
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promo_code_entity_1.PromoCode)),
    __param(1, (0, typeorm_1.InjectRepository)(promo_usage_entity_1.PromoUsage)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        in_app_notifications_service_1.InAppNotificationsService,
        push_notifications_service_1.PushNotificationsService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map