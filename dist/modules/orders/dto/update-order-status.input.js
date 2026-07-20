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
exports.UpdateOrderStatusInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const order_status_enum_1 = require("../../../common/enums/order-status.enum");
let UpdateOrderStatusInput = class UpdateOrderStatusInput {
};
exports.UpdateOrderStatusInput = UpdateOrderStatusInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateOrderStatusInput.prototype, "orderId", void 0);
__decorate([
    (0, graphql_1.Field)(() => order_status_enum_1.OrderStatus),
    (0, class_validator_1.IsEnum)(order_status_enum_1.OrderStatus),
    __metadata("design:type", String)
], UpdateOrderStatusInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderStatusInput.prototype, "adminNotes", void 0);
exports.UpdateOrderStatusInput = UpdateOrderStatusInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateOrderStatusInput);
//# sourceMappingURL=update-order-status.input.js.map