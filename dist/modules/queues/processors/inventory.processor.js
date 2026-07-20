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
var InventoryProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const product_entity_1 = require("../../products/entities/product.entity");
const notifications_service_1 = require("../../notifications/notifications.service");
const queue_constants_1 = require("../jobs/queue.constants");
const LOW_STOCK_THRESHOLD = 5;
let InventoryProcessor = InventoryProcessor_1 = class InventoryProcessor {
    constructor(productRepo, notificationsService, configService) {
        this.productRepo = productRepo;
        this.notificationsService = notificationsService;
        this.configService = configService;
        this.logger = new common_1.Logger(InventoryProcessor_1.name);
    }
    async handleLowStockAlert(_job) {
        this.logger.log('Running low stock check...');
        const lowStockProducts = await this.productRepo.find({
            where: { stockCount: (0, typeorm_2.LessThanOrEqual)(LOW_STOCK_THRESHOLD), isAvailable: true },
        });
        if (lowStockProducts.length === 0) {
            this.logger.log('No low stock products found');
            return;
        }
        const adminEmail = this.configService.get('ADMIN_ALERT_EMAIL');
        for (const product of lowStockProducts) {
            this.logger.warn(`LOW STOCK: ${product.name} — ${product.stockCount} remaining`);
            if (adminEmail) {
                await this.notificationsService.sendLowStockAlert(adminEmail, {
                    productName: product.name,
                    stockCount: product.stockCount,
                    threshold: LOW_STOCK_THRESHOLD,
                });
            }
            else {
                this.logger.warn('ADMIN_ALERT_EMAIL is not configured — skipping low stock email');
            }
        }
        return { lowStockCount: lowStockProducts.length };
    }
    async handleStockUpdate(job) {
        const { productId, quantity } = job.data;
        const product = await this.productRepo.findOne({ where: { id: productId } });
        if (!product)
            return;
        product.stockCount = Math.max(0, product.stockCount - quantity);
        if (product.stockCount === 0) {
            product.isAvailable = false;
            this.logger.warn(`Product ${product.name} is now out of stock`);
        }
        await this.productRepo.save(product);
        this.logger.log(`Stock updated: ${product.name} — new count: ${product.stockCount}`);
    }
};
exports.InventoryProcessor = InventoryProcessor;
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_INVENTORY_LOW_STOCK_ALERT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryProcessor.prototype, "handleLowStockAlert", null);
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_INVENTORY_STOCK_UPDATE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InventoryProcessor.prototype, "handleStockUpdate", null);
exports.InventoryProcessor = InventoryProcessor = InventoryProcessor_1 = __decorate([
    (0, bull_1.Processor)(queue_constants_1.QUEUE_INVENTORY),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        config_1.ConfigService])
], InventoryProcessor);
//# sourceMappingURL=inventory.processor.js.map