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
exports.CustomOrderPayment = exports.CustomPaymentStatus = exports.CustomPaymentMethod = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var CustomPaymentMethod;
(function (CustomPaymentMethod) {
    CustomPaymentMethod["PAYSTACK"] = "PAYSTACK";
    CustomPaymentMethod["MANUAL_TRANSFER"] = "MANUAL_TRANSFER";
})(CustomPaymentMethod || (exports.CustomPaymentMethod = CustomPaymentMethod = {}));
var CustomPaymentStatus;
(function (CustomPaymentStatus) {
    CustomPaymentStatus["PENDING"] = "PENDING";
    CustomPaymentStatus["PROOF_UPLOADED"] = "PROOF_UPLOADED";
    CustomPaymentStatus["CONFIRMED"] = "CONFIRMED";
    CustomPaymentStatus["FAILED"] = "FAILED";
    CustomPaymentStatus["REFUNDED"] = "REFUNDED";
})(CustomPaymentStatus || (exports.CustomPaymentStatus = CustomPaymentStatus = {}));
(0, graphql_1.registerEnumType)(CustomPaymentMethod, { name: 'CustomPaymentMethod' });
(0, graphql_1.registerEnumType)(CustomPaymentStatus, { name: 'CustomPaymentStatus' });
let CustomOrderPayment = class CustomOrderPayment {
};
exports.CustomOrderPayment = CustomOrderPayment;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "requestId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "agreementId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CustomOrderPayment.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)(() => CustomPaymentMethod),
    (0, typeorm_1.Column)({ type: 'enum', enum: CustomPaymentMethod }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "method", void 0);
__decorate([
    (0, graphql_1.Field)(() => CustomPaymentStatus),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CustomPaymentStatus,
        default: CustomPaymentStatus.PENDING,
    }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "paystackReference", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "paystackTransactionId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "authorizationUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "transferProofUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "transferProofKey", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "transferReference", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "confirmedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CustomOrderPayment.prototype, "confirmedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomOrderPayment.prototype, "adminNote", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CustomOrderPayment.prototype, "paidAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustomOrderPayment.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustomOrderPayment.prototype, "updatedAt", void 0);
exports.CustomOrderPayment = CustomOrderPayment = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('custom_order_payments')
], CustomOrderPayment);
//# sourceMappingURL=custom-order-payment.entity.js.map