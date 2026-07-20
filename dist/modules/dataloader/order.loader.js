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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderLoader = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dataloader_1 = __importDefault(require("dataloader"));
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
let OrderLoader = class OrderLoader {
    constructor(orderRepo, itemRepo) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
        this.byId = new dataloader_1.default(async (ids) => {
            const orders = await this.orderRepo.find({
                where: { id: (0, typeorm_2.In)([...ids]) },
            });
            const map = new Map(orders.map((o) => [o.id, o]));
            return ids.map((id) => map.get(id) ?? null);
        }, { cache: true });
        this.itemsByOrderId = new dataloader_1.default(async (orderIds) => {
            const items = await this.itemRepo.find({
                where: { orderId: (0, typeorm_2.In)([...orderIds]) },
            });
            const map = new Map();
            for (const item of items) {
                if (!map.has(item.orderId))
                    map.set(item.orderId, []);
                map.get(item.orderId).push(item);
            }
            return orderIds.map((id) => map.get(id) ?? []);
        }, { cache: true });
        this.byUserId = new dataloader_1.default(async (userIds) => {
            const orders = await this.orderRepo.find({
                where: { userId: (0, typeorm_2.In)([...userIds]) },
                order: { createdAt: 'DESC' },
            });
            const map = new Map();
            for (const order of orders) {
                if (!map.has(order.userId))
                    map.set(order.userId, []);
                map.get(order.userId).push(order);
            }
            return userIds.map((id) => map.get(id) ?? []);
        }, { cache: true });
    }
};
exports.OrderLoader = OrderLoader;
exports.OrderLoader = OrderLoader = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrderLoader);
//# sourceMappingURL=order.loader.js.map