"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataloaderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_loader_1 = require("./product.loader");
const user_loader_1 = require("./user.loader");
const order_loader_1 = require("./order.loader");
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../products/entities/category.entity");
const product_media_entity_1 = require("../products/entities/product-media.entity");
const product_variant_entity_1 = require("../products/entities/product-variant.entity");
const user_entity_1 = require("../users/entities/user.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const entities = typeorm_1.TypeOrmModule.forFeature([
    product_entity_1.Product,
    category_entity_1.Category,
    product_media_entity_1.ProductMedia,
    product_variant_entity_1.ProductVariant,
    user_entity_1.User,
    order_entity_1.Order,
    order_item_entity_1.OrderItem,
]);
let DataloaderModule = class DataloaderModule {
};
exports.DataloaderModule = DataloaderModule;
exports.DataloaderModule = DataloaderModule = __decorate([
    (0, common_1.Module)({
        imports: [entities],
        providers: [product_loader_1.ProductLoader, user_loader_1.UserLoader, order_loader_1.OrderLoader],
        exports: [product_loader_1.ProductLoader, user_loader_1.UserLoader, order_loader_1.OrderLoader, entities],
    })
], DataloaderModule);
//# sourceMappingURL=dataloader.module.js.map