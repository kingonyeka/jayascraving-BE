"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomOrdersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const custom_orders_service_1 = require("./custom-orders.service");
const custom_orders_resolver_1 = require("./custom-orders.resolver");
const custom_order_request_entity_1 = require("./entities/custom-order-request.entity");
const custom_order_quote_entity_1 = require("./entities/custom-order-quote.entity");
const custom_order_agreement_entity_1 = require("./entities/custom-order-agreement.entity");
const custom_order_payment_entity_1 = require("./entities/custom-order-payment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let CustomOrdersModule = class CustomOrdersModule {
};
exports.CustomOrdersModule = CustomOrdersModule;
exports.CustomOrdersModule = CustomOrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                custom_order_request_entity_1.CustomOrderRequest,
                custom_order_quote_entity_1.CustomOrderQuote,
                custom_order_agreement_entity_1.CustomOrderAgreement,
                custom_order_payment_entity_1.CustomOrderPayment,
                user_entity_1.User,
            ]),
            notifications_module_1.NotificationsModule,
        ],
        providers: [custom_orders_service_1.CustomOrdersService, custom_orders_resolver_1.CustomOrdersResolver],
        exports: [custom_orders_service_1.CustomOrdersService],
    })
], CustomOrdersModule);
//# sourceMappingURL=custom-orders.module.js.map