"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const real_time_analytics_service_1 = require("./real-time-analytics.service");
const real_time_analytics_controller_1 = require("./real-time-analytics.controller");
const order_entity_1 = require("../orders/entities/order.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const user_entity_1 = require("../users/entities/user.entity");
let RealTimeAnalyticsModule = class RealTimeAnalyticsModule {
};
exports.RealTimeAnalyticsModule = RealTimeAnalyticsModule;
exports.RealTimeAnalyticsModule = RealTimeAnalyticsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, payment_entity_1.Payment, user_entity_1.User])],
        providers: [real_time_analytics_service_1.RealTimeAnalyticsService],
        controllers: [real_time_analytics_controller_1.RealTimeAnalyticsController],
        exports: [real_time_analytics_service_1.RealTimeAnalyticsService],
    })
], RealTimeAnalyticsModule);
//# sourceMappingURL=real-time-analytics.module.js.map