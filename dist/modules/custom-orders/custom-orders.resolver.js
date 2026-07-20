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
exports.CustomOrdersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const custom_orders_service_1 = require("./custom-orders.service");
const custom_order_request_entity_1 = require("./entities/custom-order-request.entity");
const custom_order_quote_entity_1 = require("./entities/custom-order-quote.entity");
const custom_order_agreement_entity_1 = require("./entities/custom-order-agreement.entity");
const custom_order_payment_entity_1 = require("./entities/custom-order-payment.entity");
const create_custom_order_input_1 = require("./dto/create-custom-order.input");
const create_quote_input_1 = require("./dto/create-quote.input");
const respond_to_quote_input_1 = require("./dto/respond-to-quote.input");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
let PaginatedCustomOrders = class PaginatedCustomOrders extends (0, paginated_result_type_1.PaginatedResult)(custom_order_request_entity_1.CustomOrderRequest) {
};
PaginatedCustomOrders = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedCustomOrders);
let CustomOrdersResolver = class CustomOrdersResolver {
    constructor(customOrdersService) {
        this.customOrdersService = customOrdersService;
    }
    myCustomOrders(user, pagination) {
        return this.customOrdersService.getMyRequests(user.id, pagination);
    }
    customOrder(id) {
        return this.customOrdersService.getRequestById(id);
    }
    customOrderQuotes(user, requestId) {
        return this.customOrdersService.getQuotesForRequest(requestId, user.id);
    }
    customOrderAgreement(requestId) {
        return this.customOrdersService.getAgreement(requestId);
    }
    customOrderPayment(requestId) {
        return this.customOrdersService.getPaymentByRequest(requestId);
    }
    allCustomOrders(status, pagination) {
        return this.customOrdersService.getAllRequests(status, pagination);
    }
    createCustomOrder(user, input, mediaUrls, mediaKeys) {
        return this.customOrdersService.createRequest(user.id, input, mediaUrls ?? [], mediaKeys ?? []);
    }
    respondToQuote(user, input) {
        return this.customOrdersService.respondToQuote(user.id, input);
    }
    uploadTransferProof(user, paymentId, proofUrl, proofKey, transferReference) {
        return this.customOrdersService.uploadTransferProof(paymentId, user.id, proofUrl, proofKey, transferReference);
    }
    createQuote(user, input) {
        return this.customOrdersService.createQuote(user.id, input);
    }
    updateCustomOrderStatus(requestId, status, adminNotes, assignedTo) {
        return this.customOrdersService.updateRequestStatus(requestId, status, adminNotes, assignedTo);
    }
    confirmManualTransfer(user, paymentId, adminNote) {
        return this.customOrdersService.confirmManualTransfer(paymentId, user.id, adminNote);
    }
};
exports.CustomOrdersResolver = CustomOrdersResolver;
__decorate([
    (0, graphql_1.Query)(() => PaginatedCustomOrders, { description: 'Get current user custom order requests' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "myCustomOrders", null);
__decorate([
    (0, graphql_1.Query)(() => custom_order_request_entity_1.CustomOrderRequest, { description: 'Get a custom order request by ID' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "customOrder", null);
__decorate([
    (0, graphql_1.Query)(() => [custom_order_quote_entity_1.CustomOrderQuote], { description: 'Get all quotes for a custom order request' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('requestId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "customOrderQuotes", null);
__decorate([
    (0, graphql_1.Query)(() => custom_order_agreement_entity_1.CustomOrderAgreement, { nullable: true, description: 'Get agreement for a custom order' }),
    __param(0, (0, graphql_1.Args)('requestId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "customOrderAgreement", null);
__decorate([
    (0, graphql_1.Query)(() => custom_order_payment_entity_1.CustomOrderPayment, { nullable: true, description: 'Get payment for a custom order' }),
    __param(0, (0, graphql_1.Args)('requestId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "customOrderPayment", null);
__decorate([
    (0, graphql_1.Query)(() => PaginatedCustomOrders, { description: 'Admin: get all custom order requests' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('status', { type: () => custom_order_request_entity_1.CustomOrderStatus, nullable: true })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "allCustomOrders", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_order_request_entity_1.CustomOrderRequest, { description: 'Submit a custom cake order request' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Args)('mediaUrls', { type: () => [String], nullable: true })),
    __param(3, (0, graphql_1.Args)('mediaKeys', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_custom_order_input_1.CreateCustomOrderInput, Array, Array]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "createCustomOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_order_quote_entity_1.CustomOrderQuote, { description: 'Respond to a quote — accept, reject or negotiate' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        respond_to_quote_input_1.RespondToQuoteInput]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "respondToQuote", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_order_payment_entity_1.CustomOrderPayment, { description: 'Upload bank transfer proof for a custom order payment' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('paymentId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('proofUrl')),
    __param(3, (0, graphql_1.Args)('proofKey')),
    __param(4, (0, graphql_1.Args)('transferReference', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "uploadTransferProof", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_order_quote_entity_1.CustomOrderQuote, { description: 'Admin: send a price quote to customer' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_quote_input_1.CreateQuoteInput]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "createQuote", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_order_request_entity_1.CustomOrderRequest, { description: 'Admin: update custom order request status' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('requestId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('status', { type: () => custom_order_request_entity_1.CustomOrderStatus })),
    __param(2, (0, graphql_1.Args)('adminNotes', { nullable: true })),
    __param(3, (0, graphql_1.Args)('assignedTo', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "updateCustomOrderStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => custom_order_payment_entity_1.CustomOrderPayment, { description: 'Admin: confirm a manual bank transfer payment' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('paymentId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('adminNote', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], CustomOrdersResolver.prototype, "confirmManualTransfer", null);
exports.CustomOrdersResolver = CustomOrdersResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [custom_orders_service_1.CustomOrdersService])
], CustomOrdersResolver);
//# sourceMappingURL=custom-orders.resolver.js.map