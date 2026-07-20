"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const orders_service_1 = require("./orders.service");
const orders_resolver_1 = require("./orders.resolver");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const order_customisation_entity_1 = require("./entities/order-customisation.entity");
const user_entity_1 = require("../users/entities/user.entity");
const cart_module_1 = require("../cart/cart.module");
const queues_module_1 = require("../queues/queues.module");
const staff_module_1 = require("../staff/staff.module");
const promotions_module_1 = require("../promotions/promotions.module");
const notifications_module_1 = require("../notifications/notifications.module");
const abandoned_cart_module_1 = require("../abandoned-cart/abandoned-cart.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([order_entity_1.Order, order_item_entity_1.OrderItem, order_customisation_entity_1.OrderCustomisation, user_entity_1.User]),
            cart_module_1.CartModule,
            queues_module_1.QueuesModule,
            staff_module_1.StaffModule,
            promotions_module_1.PromotionsModule,
            notifications_module_1.NotificationsModule,
            abandoned_cart_module_1.AbandonedCartModule,
        ],
        providers: [orders_service_1.OrdersService, orders_resolver_1.OrdersResolver],
        exports: [orders_service_1.OrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map