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
exports.PaymentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const payment_entity_1 = require("./entities/payment.entity");
const initiate_payment_input_1 = require("./dto/initiate-payment.input");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let InitiatePaymentResult = class InitiatePaymentResult {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], InitiatePaymentResult.prototype, "authorizationUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], InitiatePaymentResult.prototype, "reference", void 0);
__decorate([
    (0, graphql_1.Field)(() => payment_entity_1.Payment),
    __metadata("design:type", payment_entity_1.Payment)
], InitiatePaymentResult.prototype, "payment", void 0);
InitiatePaymentResult = __decorate([
    (0, graphql_1.ObjectType)()
], InitiatePaymentResult);
let PaymentsResolver = class PaymentsResolver {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    initiatePayment(user, input) {
        return this.paymentsService.initiatePayment(user.id, user.email, input);
    }
    verifyPayment(reference) {
        return this.paymentsService.verifyPayment(reference);
    }
    paymentByOrder(orderId) {
        return this.paymentsService.getPaymentByOrder(orderId);
    }
    myPayments(user) {
        return this.paymentsService.getPaymentsByUser(user.id);
    }
};
exports.PaymentsResolver = PaymentsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => InitiatePaymentResult, { description: 'Start a Paystack transaction for an order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        initiate_payment_input_1.InitiatePaymentInput]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "initiatePayment", null);
__decorate([
    (0, graphql_1.Mutation)(() => payment_entity_1.Payment, { description: 'Manually verify a payment (e.g. after the Paystack redirect callback)' }),
    __param(0, (0, graphql_1.Args)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "verifyPayment", null);
__decorate([
    (0, graphql_1.Query)(() => payment_entity_1.Payment, { nullable: true, description: 'Get the payment for a given order' }),
    __param(0, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "paymentByOrder", null);
__decorate([
    (0, graphql_1.Query)(() => [payment_entity_1.Payment], { description: "Get the current user's payment history" }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "myPayments", null);
exports.PaymentsResolver = PaymentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => payment_entity_1.Payment),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsResolver);
//# sourceMappingURL=payments.resolver.js.map