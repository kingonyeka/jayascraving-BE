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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const delivery_service_1 = require("./delivery.service");
const delivery_zone_entity_1 = require("./entities/delivery-zone.entity");
const delivery_slot_entity_1 = require("./entities/delivery-slot.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let DeliveryResolver = class DeliveryResolver {
    constructor(deliveryService) {
        this.deliveryService = deliveryService;
    }
    deliveryZones() {
        return this.deliveryService.getActiveZones();
    }
    deliverySlots(day) {
        return this.deliveryService.getActiveSlots(day);
    }
    deliveryZoneByArea(area) {
        return this.deliveryService.getZoneByArea(area);
    }
    allDeliveryZones() {
        return this.deliveryService.getAllZones();
    }
    allDeliverySlots() {
        return this.deliveryService.getAllSlots();
    }
    createDeliveryZone(name, deliveryFee, areas, description) {
        return this.deliveryService.createZone(name, deliveryFee, areas, description);
    }
    updateDeliveryZone(id, name, deliveryFee, areas, isActive) {
        return this.deliveryService.updateZone(id, { name, deliveryFee, areas, isActive });
    }
    deleteDeliveryZone(id) {
        return this.deliveryService.deleteZone(id);
    }
    createDeliverySlot(label, startTime, endTime, maxOrders, availableDays) {
        return this.deliveryService.createSlot(label, startTime, endTime, maxOrders, availableDays);
    }
    updateDeliverySlot(id, label, maxOrders, isActive, availableDays) {
        return this.deliveryService.updateSlot(id, { label, maxOrders, isActive, availableDays });
    }
    deleteDeliverySlot(id) {
        return this.deliveryService.deleteSlot(id);
    }
};
exports.DeliveryResolver = DeliveryResolver;
__decorate([
    (0, graphql_1.Query)(() => [delivery_zone_entity_1.DeliveryZone], { description: 'Get all active delivery zones' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "deliveryZones", null);
__decorate([
    (0, graphql_1.Query)(() => [delivery_slot_entity_1.DeliverySlot], { description: 'Get available delivery slots, optionally filtered by day (MON, TUE, etc.)' }),
    __param(0, (0, graphql_1.Args)('day', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "deliverySlots", null);
__decorate([
    (0, graphql_1.Query)(() => delivery_zone_entity_1.DeliveryZone, { nullable: true, description: 'Find delivery zone by area name' }),
    __param(0, (0, graphql_1.Args)('area')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "deliveryZoneByArea", null);
__decorate([
    (0, graphql_1.Query)(() => [delivery_zone_entity_1.DeliveryZone], { description: 'Admin: get all delivery zones including inactive' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "allDeliveryZones", null);
__decorate([
    (0, graphql_1.Query)(() => [delivery_slot_entity_1.DeliverySlot], { description: 'Admin: get all delivery slots including inactive' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "allDeliverySlots", null);
__decorate([
    (0, graphql_1.Mutation)(() => delivery_zone_entity_1.DeliveryZone, { description: 'Admin: create a delivery zone' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('name')),
    __param(1, (0, graphql_1.Args)('deliveryFee', { type: () => graphql_1.Float })),
    __param(2, (0, graphql_1.Args)('areas', { type: () => [String] })),
    __param(3, (0, graphql_1.Args)('description', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Array, String]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "createDeliveryZone", null);
__decorate([
    (0, graphql_1.Mutation)(() => delivery_zone_entity_1.DeliveryZone, { description: 'Admin: update a delivery zone' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('name', { nullable: true })),
    __param(2, (0, graphql_1.Args)('deliveryFee', { type: () => graphql_1.Float, nullable: true })),
    __param(3, (0, graphql_1.Args)('areas', { type: () => [String], nullable: true })),
    __param(4, (0, graphql_1.Args)('isActive', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Array, Boolean]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "updateDeliveryZone", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: delete a delivery zone' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "deleteDeliveryZone", null);
__decorate([
    (0, graphql_1.Mutation)(() => delivery_slot_entity_1.DeliverySlot, { description: 'Admin: create a delivery time slot' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('label')),
    __param(1, (0, graphql_1.Args)('startTime')),
    __param(2, (0, graphql_1.Args)('endTime')),
    __param(3, (0, graphql_1.Args)('maxOrders', { type: () => graphql_1.Int, defaultValue: 10 })),
    __param(4, (0, graphql_1.Args)('availableDays', { type: () => [String] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Array]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "createDeliverySlot", null);
__decorate([
    (0, graphql_1.Mutation)(() => delivery_slot_entity_1.DeliverySlot, { description: 'Admin: update a delivery slot' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('label', { nullable: true })),
    __param(2, (0, graphql_1.Args)('maxOrders', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('isActive', { nullable: true })),
    __param(4, (0, graphql_1.Args)('availableDays', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Boolean, Array]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "updateDeliverySlot", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: delete a delivery slot' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryResolver.prototype, "deleteDeliverySlot", null);
exports.DeliveryResolver = DeliveryResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [delivery_service_1.DeliveryService])
], DeliveryResolver);
//# sourceMappingURL=delivery.resolver.js.map