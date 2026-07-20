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
var AbandonedCartService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbandonedCartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const cart_entity_1 = require("../cart/entities/cart.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const queue_constants_1 = require("../queues/jobs/queue.constants");
const ABANDONED_AFTER_HOURS = 2;
const RECOVERY_EMAIL_DELAY_HOURS = 1;
let AbandonedCartService = AbandonedCartService_1 = class AbandonedCartService {
    constructor(cartRepo, userRepo, dataSource, cartQueue, notificationsService, configService) {
        this.cartRepo = cartRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
        this.cartQueue = cartQueue;
        this.notificationsService = notificationsService;
        this.configService = configService;
        this.logger = new common_1.Logger(AbandonedCartService_1.name);
    }
    async scheduleRecovery(cartId, userId) {
        const delayMs = (ABANDONED_AFTER_HOURS + RECOVERY_EMAIL_DELAY_HOURS) * 60 * 60 * 1000;
        const jobId = `cart-recovery:${cartId}`;
        const existing = await this.cartQueue.getJob(jobId);
        if (existing)
            await existing.remove();
        await this.cartQueue.add(queue_constants_1.JOB_CART_SEND_RECOVERY, { cartId, userId }, { delay: delayMs, jobId, attempts: 2 });
        this.logger.debug(`Recovery email scheduled for cart ${cartId} in ${ABANDONED_AFTER_HOURS + RECOVERY_EMAIL_DELAY_HOURS}h`);
    }
    async cancelRecovery(cartId) {
        const job = await this.cartQueue.getJob(`cart-recovery:${cartId}`);
        if (job) {
            await job.remove();
            this.logger.debug(`Recovery email cancelled for cart ${cartId} — user checked out`);
        }
    }
    async processRecoveryEmail(cartId, userId) {
        const cart = await this.cartRepo.findOne({
            where: { id: cartId },
            relations: ['items'],
        });
        if (!cart || !cart.items?.length) {
            this.logger.log(`Cart ${cartId} is empty — skipping recovery email`);
            return;
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            return;
        const cartTotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
        const itemSummary = cart.items
            .slice(0, 3)
            .map((i) => `${i.productName} x${i.quantity}`)
            .join(', ');
        this.logger.log(`Sending abandoned cart recovery email to ${user.email} — ${cart.items.length} items (${itemSummary}), NGN ${cartTotal.toLocaleString()}`);
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');
        await this.notificationsService.sendAbandonedCartRecovery(user.email, {
            customerName: user.fullName,
            itemSummary,
            itemCount: cart.items.length,
            cartTotal,
            checkoutUrl: `${frontendUrl}/cart`,
        });
    }
    async findAbandonedCarts() {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - ABANDONED_AFTER_HOURS);
        return this.cartRepo
            .createQueryBuilder('cart')
            .innerJoinAndSelect('cart.items', 'items')
            .where('cart.userId IS NOT NULL')
            .andWhere('cart.updatedAt < :cutoff', { cutoff })
            .getMany();
    }
    async getAbandonedCartCount() {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - ABANDONED_AFTER_HOURS);
        return this.cartRepo
            .createQueryBuilder('cart')
            .innerJoin('cart.items', 'items')
            .where('cart.userId IS NOT NULL')
            .andWhere('cart.updatedAt < :cutoff', { cutoff })
            .getCount();
    }
    async cleanupExpiredGuestCarts() {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const oldCarts = await this.cartRepo.find({
            where: {
                userId: (0, typeorm_2.IsNull)(),
                updatedAt: (0, typeorm_2.LessThan)(cutoff),
            },
            relations: ['items'],
        });
        if (!oldCarts.length)
            return 0;
        await this.dataSource.transaction(async (manager) => {
            for (const cart of oldCarts) {
                for (const item of cart.items ?? []) {
                    const product = await manager.findOne(product_entity_1.Product, { where: { id: item.productId } });
                    if (product && product.stockCount >= 0) {
                        await manager.increment(product_entity_1.Product, { id: item.productId }, 'stockCount', item.quantity);
                    }
                }
            }
            await manager.remove(cart_entity_1.Cart, oldCarts);
        });
        this.logger.log(`Cleaned up ${oldCarts.length} expired guest carts and released their reserved stock`);
        return oldCarts.length;
    }
    async scheduleDailyCleanup() {
        await this.cartQueue.add(queue_constants_1.JOB_CART_CLEANUP, {}, {
            repeat: { cron: '0 2 * * *' },
            jobId: 'daily-cart-cleanup',
        });
        this.logger.log('Daily cart cleanup job scheduled');
    }
};
exports.AbandonedCartService = AbandonedCartService;
exports.AbandonedCartService = AbandonedCartService = AbandonedCartService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, bull_1.InjectQueue)(queue_constants_1.QUEUE_ABANDONED_CART)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource, Object, notifications_service_1.NotificationsService,
        config_1.ConfigService])
], AbandonedCartService);
//# sourceMappingURL=abandoned-cart.service.js.map