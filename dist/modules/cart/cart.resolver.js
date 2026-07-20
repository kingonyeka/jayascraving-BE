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
exports.CartResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const cart_service_1 = require("./cart.service");
const cart_entity_1 = require("./entities/cart.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const jwt_auth_guard_2 = require("../../common/guards/jwt-auth.guard");
let CartResolver = class CartResolver {
    constructor(cartService) {
        this.cartService = cartService;
    }
    async myCart(user, sessionId) {
        return this.cartService.getOrCreateCart(user?.id, sessionId);
    }
    async addToCart(user, productId, quantity, variantId, customisations, specialInstructions, sessionId) {
        return this.cartService.addItem(user?.id, sessionId, productId, quantity, variantId, customisations, specialInstructions);
    }
    async updateCartItem(user, cartItemId, quantity, sessionId) {
        return this.cartService.updateItemQuantity(cartItemId, quantity, user?.id, sessionId);
    }
    async removeFromCart(user, cartItemId, sessionId) {
        return this.cartService.removeItem(cartItemId, user?.id, sessionId);
    }
    async clearCart(user, sessionId) {
        return this.cartService.clearCart(user?.id, sessionId);
    }
    async mergeCart(user, sessionId) {
        return this.cartService.mergeGuestCart(sessionId, user.id);
    }
};
exports.CartResolver = CartResolver;
__decorate([
    (0, graphql_1.Query)(() => cart_entity_1.Cart, { description: 'Get current cart — pass sessionId for guest' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('sessionId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "myCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_entity_1.Cart, { description: 'Add a product to cart' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('quantity', { type: () => graphql_1.Int, defaultValue: 1 })),
    __param(3, (0, graphql_1.Args)('variantId', { type: () => graphql_1.ID, nullable: true })),
    __param(4, (0, graphql_1.Args)('customisations', { nullable: true })),
    __param(5, (0, graphql_1.Args)('specialInstructions', { nullable: true })),
    __param(6, (0, graphql_1.Args)('sessionId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "addToCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_entity_1.Cart, { description: 'Update cart item quantity (0 = remove)' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('cartItemId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('quantity', { type: () => graphql_1.Int })),
    __param(3, (0, graphql_1.Args)('sessionId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Number, String]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "updateCartItem", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_entity_1.Cart, { description: 'Remove an item from cart' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('cartItemId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('sessionId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "removeFromCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Clear all items from cart' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('sessionId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "clearCart", null);
__decorate([
    (0, graphql_1.Mutation)(() => cart_entity_1.Cart, { description: 'Merge guest cart into user cart after login' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], CartResolver.prototype, "mergeCart", null);
exports.CartResolver = CartResolver = __decorate([
    (0, graphql_1.Resolver)(() => cart_entity_1.Cart),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartResolver);
//# sourceMappingURL=cart.resolver.js.map