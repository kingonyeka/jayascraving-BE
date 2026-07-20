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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomOrderRequest = exports.CustomOrderStatus = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var CustomOrderStatus;
(function (CustomOrderStatus) {
    CustomOrderStatus["SUBMITTED"] = "SUBMITTED";
    CustomOrderStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    CustomOrderStatus["QUOTE_SENT"] = "QUOTE_SENT";
    CustomOrderStatus["NEGOTIATING"] = "NEGOTIATING";
    CustomOrderStatus["QUOTE_ACCEPTED"] = "QUOTE_ACCEPTED";
    CustomOrderStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    CustomOrderStatus["PAID"] = "PAID";
    CustomOrderStatus["IN_PRODUCTION"] = "IN_PRODUCTION";
    CustomOrderStatus["BAKING"] = "BAKING";
    CustomOrderStatus["READY"] = "READY";
    CustomOrderStatus["DELIVERED"] = "DELIVERED";
    CustomOrderStatus["CANCELLED"] = "CANCELLED";
    CustomOrderStatus["REJECTED"] = "REJECTED";
})(CustomOrderStatus || (exports.CustomOrderStatus = CustomOrderStatus = {}));
(0, graphql_1.registerEnumType)(CustomOrderStatus, {
    name: 'CustomOrderStatus',
    description: 'Status of a custom cake order request',
});
let CustomOrderRequest = class CustomOrderRequest {
};
exports.CustomOrderRequest = CustomOrderRequest;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "requestNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "occasion", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "approximateBudget", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CustomOrderRequest.prototype, "preferredDeliveryDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "preferredDeliveryTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], CustomOrderRequest.prototype, "mediaUrls", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], CustomOrderRequest.prototype, "mediaKeys", void 0);
__decorate([
    (0, graphql_1.Field)(() => CustomOrderStatus),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CustomOrderStatus,
        default: CustomOrderStatus.SUBMITTED,
    }),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "customerNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "adminNotes", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderRequest.prototype, "assignedTo", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustomOrderRequest.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustomOrderRequest.prototype, "updatedAt", void 0);
exports.CustomOrderRequest = CustomOrderRequest = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('custom_order_requests')
], CustomOrderRequest);
//# sourceMappingURL=custom-order-request.entity.js.map