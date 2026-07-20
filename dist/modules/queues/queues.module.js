"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueuesModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const queues_service_1 = require("./queues.service");
const queues_resolver_1 = require("./queues.resolver");
const scheduler_service_1 = require("./scheduler.service");
const order_processor_1 = require("./processors/order.processor");
const payment_processor_1 = require("./processors/payment.processor");
const inventory_processor_1 = require("./processors/inventory.processor");
const abandoned_cart_processor_1 = require("./processors/abandoned-cart.processor");
const order_entity_1 = require("../orders/entities/order.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const product_entity_1 = require("../products/entities/product.entity");
const cart_entity_1 = require("../cart/entities/cart.entity");
const user_entity_1 = require("../users/entities/user.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const abandoned_cart_module_1 = require("../abandoned-cart/abandoned-cart.module");
const payments_module_1 = require("../payments/payments.module");
const queue_defaults_1 = require("./jobs/queue-defaults");
const queue_constants_1 = require("./jobs/queue.constants");
let QueuesModule = class QueuesModule {
};
exports.QueuesModule = QueuesModule;
exports.QueuesModule = QueuesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, payment_entity_1.Payment, product_entity_1.Product, cart_entity_1.Cart, user_entity_1.User]),
            bull_1.BullModule.registerQueue({ name: queue_constants_1.QUEUE_ORDER, ...queue_defaults_1.queueDefaults }, { name: queue_constants_1.QUEUE_PAYMENT, ...queue_defaults_1.queueDefaults }, { name: queue_constants_1.QUEUE_INVENTORY, ...queue_defaults_1.queueDefaults }),
            notifications_module_1.NotificationsModule,
            abandoned_cart_module_1.AbandonedCartModule,
            (0, common_1.forwardRef)(() => payments_module_1.PaymentsModule),
        ],
        providers: [
            queues_service_1.QueuesService,
            queues_resolver_1.QueuesResolver,
            scheduler_service_1.SchedulerService,
            order_processor_1.OrderProcessor,
            payment_processor_1.PaymentProcessor,
            inventory_processor_1.InventoryProcessor,
            abandoned_cart_processor_1.AbandonedCartProcessor,
        ],
        exports: [queues_service_1.QueuesService],
    })
], QueuesModule);
//# sourceMappingURL=queues.module.js.map