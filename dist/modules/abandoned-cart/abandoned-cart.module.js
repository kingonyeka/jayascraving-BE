"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbandonedCartModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const abandoned_cart_service_1 = require("./abandoned-cart.service");
const cart_entity_1 = require("../cart/entities/cart.entity");
const user_entity_1 = require("../users/entities/user.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const queue_constants_1 = require("../queues/jobs/queue.constants");
const queue_defaults_1 = require("../queues/jobs/queue-defaults");
const queueRegistration = bull_1.BullModule.registerQueue({
    name: queue_constants_1.QUEUE_ABANDONED_CART,
    ...queue_defaults_1.queueDefaults,
});
let AbandonedCartModule = class AbandonedCartModule {
};
exports.AbandonedCartModule = AbandonedCartModule;
exports.AbandonedCartModule = AbandonedCartModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cart_entity_1.Cart, user_entity_1.User]),
            queueRegistration,
            notifications_module_1.NotificationsModule,
        ],
        providers: [abandoned_cart_service_1.AbandonedCartService],
        exports: [abandoned_cart_service_1.AbandonedCartService, queueRegistration],
    })
], AbandonedCartModule);
//# sourceMappingURL=abandoned-cart.module.js.map