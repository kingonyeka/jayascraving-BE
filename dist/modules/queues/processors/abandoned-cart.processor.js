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
var AbandonedCartProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbandonedCartProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const abandoned_cart_service_1 = require("../../abandoned-cart/abandoned-cart.service");
const queue_constants_1 = require("../jobs/queue.constants");
let AbandonedCartProcessor = AbandonedCartProcessor_1 = class AbandonedCartProcessor {
    constructor(abandonedCartService) {
        this.abandonedCartService = abandonedCartService;
        this.logger = new common_1.Logger(AbandonedCartProcessor_1.name);
    }
    async handleSendRecovery(job) {
        const { cartId, userId } = job.data;
        await this.abandonedCartService.processRecoveryEmail(cartId, userId);
    }
    async handleCartCleanup(_job) {
        const cleaned = await this.abandonedCartService.cleanupExpiredGuestCarts();
        this.logger.log(`Cart cleanup job finished — ${cleaned} cart(s) removed`);
        return { cleaned };
    }
};
exports.AbandonedCartProcessor = AbandonedCartProcessor;
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_CART_SEND_RECOVERY),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbandonedCartProcessor.prototype, "handleSendRecovery", null);
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_CART_CLEANUP),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbandonedCartProcessor.prototype, "handleCartCleanup", null);
exports.AbandonedCartProcessor = AbandonedCartProcessor = AbandonedCartProcessor_1 = __decorate([
    (0, bull_1.Processor)(queue_constants_1.QUEUE_ABANDONED_CART),
    __metadata("design:paramtypes", [abandoned_cart_service_1.AbandonedCartService])
], AbandonedCartProcessor);
//# sourceMappingURL=abandoned-cart.processor.js.map