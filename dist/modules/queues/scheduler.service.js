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
var SchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const queues_service_1 = require("./queues.service");
const abandoned_cart_service_1 = require("../abandoned-cart/abandoned-cart.service");
let SchedulerService = SchedulerService_1 = class SchedulerService {
    constructor(queuesService, abandonedCartService) {
        this.queuesService = queuesService;
        this.abandonedCartService = abandonedCartService;
        this.logger = new common_1.Logger(SchedulerService_1.name);
    }
    async onApplicationBootstrap() {
        await this.abandonedCartService.scheduleDailyCleanup();
        this.logger.log('Scheduler bootstrap complete — daily cart cleanup registered');
    }
    async handleLowStockCheck() {
        this.logger.debug('Triggering scheduled low-stock check');
        await this.queuesService.runLowStockCheck();
    }
};
exports.SchedulerService = SchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "handleLowStockCheck", null);
exports.SchedulerService = SchedulerService = SchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queues_service_1.QueuesService,
        abandoned_cart_service_1.AbandonedCartService])
], SchedulerService);
//# sourceMappingURL=scheduler.service.js.map