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
exports.CustomOrderQuote = exports.QuoteStatus = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var QuoteStatus;
(function (QuoteStatus) {
    QuoteStatus["PENDING"] = "PENDING";
    QuoteStatus["ACCEPTED"] = "ACCEPTED";
    QuoteStatus["REJECTED"] = "REJECTED";
    QuoteStatus["SUPERSEDED"] = "SUPERSEDED";
})(QuoteStatus || (exports.QuoteStatus = QuoteStatus = {}));
(0, graphql_1.registerEnumType)(QuoteStatus, { name: 'QuoteStatus' });
let CustomOrderQuote = class CustomOrderQuote {
};
exports.CustomOrderQuote = CustomOrderQuote;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomOrderQuote.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomOrderQuote.prototype, "requestId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], CustomOrderQuote.prototype, "version", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], CustomOrderQuote.prototype, "totalAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, typeorm_1.Column)({ type: 'jsonb', default: '[]' }),
    __metadata("design:type", Array)
], CustomOrderQuote.prototype, "lineItems", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomOrderQuote.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomOrderQuote.prototype, "terms", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CustomOrderQuote.prototype, "validUntil", void 0);
__decorate([
    (0, graphql_1.Field)(() => QuoteStatus),
    (0, typeorm_1.Column)({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.PENDING }),
    __metadata("design:type", String)
], CustomOrderQuote.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], CustomOrderQuote.prototype, "customerResponse", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], CustomOrderQuote.prototype, "respondedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CustomOrderQuote.prototype, "createdBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustomOrderQuote.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CustomOrderQuote.prototype, "updatedAt", void 0);
exports.CustomOrderQuote = CustomOrderQuote = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('custom_order_quotes')
], CustomOrderQuote);
//# sourceMappingURL=custom-order-quote.entity.js.map