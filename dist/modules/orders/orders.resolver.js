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
exports.OrdersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const order_entity_1 = require("./entities/order.entity");
const create_order_input_1 = require("./dto/create-order.input");
const update_order_status_input_1 = require("./dto/update-order-status.input");
const order_filter_input_1 = require("./dto/order-filter.input");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
let PaginatedOrders = class PaginatedOrders extends (0, paginated_result_type_1.PaginatedResult)(order_entity_1.Order) {
};
PaginatedOrders = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedOrders);
let OrdersResolver = class OrdersResolver {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    myOrders(user, pagination) {
        return this.ordersService.findByUser(user.id, pagination);
    }
    order(id) {
        return this.ordersService.findById(id);
    }
    orderByNumber(orderNumber) {
        return this.ordersService.findByOrderNumber(orderNumber);
    }
    allOrders(filter, pagination) {
        return this.ordersService.findAll(filter, pagination);
    }
    createOrder(user, input) {
        return this.ordersService.createFromCart(user.id, input);
    }
    cancelOrder(user, orderId) {
        return this.ordersService.cancel(orderId, user.id);
    }
    reorder(user, orderId) {
        return this.ordersService.reorder(orderId, user.id);
    }
    updateOrderStatus(user, input) {
        return this.ordersService.updateStatus(input, user.id, user.fullName);
    }
};
exports.OrdersResolver = OrdersResolver;
__decorate([
    (0, graphql_1.Query)(() => PaginatedOrders, { description: 'Get current user order history' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "myOrders", null);
__decorate([
    (0, graphql_1.Query)(() => order_entity_1.Order, { description: 'Get a single order by ID' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "order", null);
__decorate([
    (0, graphql_1.Query)(() => order_entity_1.Order, { description: 'Get order by order number' }),
    __param(0, (0, graphql_1.Args)('orderNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "orderByNumber", null);
__decorate([
    (0, graphql_1.Query)(() => PaginatedOrders, { description: 'Admin: get all orders with filters' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES, user_role_enum_1.UserRole.BAKER, user_role_enum_1.UserRole.DELIVERY),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_filter_input_1.OrderFilterInput,
        pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "allOrders", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_entity_1.Order, { description: 'Create an order from cart' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_order_input_1.CreateOrderInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "createOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_entity_1.Order, { description: 'Cancel an order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "cancelOrder", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_entity_1.Order, { description: 'Reorder from a past order' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "reorder", null);
__decorate([
    (0, graphql_1.Mutation)(() => order_entity_1.Order, { description: 'Admin: update order status' }),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES, user_role_enum_1.UserRole.BAKER, user_role_enum_1.UserRole.DELIVERY),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        update_order_status_input_1.UpdateOrderStatusInput]),
    __metadata("design:returntype", Promise)
], OrdersResolver.prototype, "updateOrderStatus", null);
exports.OrdersResolver = OrdersResolver = __decorate([
    (0, graphql_1.Resolver)(() => order_entity_1.Order),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersResolver);
//# sourceMappingURL=orders.resolver.js.map