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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./entities/cart.entity");
const cart_item_entity_1 = require("./entities/cart-item.entity");
const products_service_1 = require("../products/products.service");
const product_entity_1 = require("../products/entities/product.entity");
const abandoned_cart_service_1 = require("../abandoned-cart/abandoned-cart.service");
let CartService = class CartService {
    constructor(cartRepo, cartItemRepo, productRepo, productsService, dataSource, abandonedCartService) {
        this.cartRepo = cartRepo;
        this.cartItemRepo = cartItemRepo;
        this.productRepo = productRepo;
        this.productsService = productsService;
        this.dataSource = dataSource;
        this.abandonedCartService = abandonedCartService;
    }
    async getOrCreateCart(userId, sessionId) {
        if (!userId && !sessionId) {
            throw new common_1.BadRequestException('userId or sessionId is required');
        }
        const where = userId ? { userId } : { sessionId };
        let cart = await this.cartRepo.findOne({ where, relations: ['items'] });
        if (!cart) {
            cart = this.cartRepo.create(userId ? { userId } : { sessionId });
            cart = await this.cartRepo.save(cart);
            cart.items = [];
        }
        return cart;
    }
    async getCartById(cartId) {
        const cart = await this.cartRepo.findOne({
            where: { id: cartId },
            relations: ['items'],
        });
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        return cart;
    }
    async addItem(userId, sessionId, productId, quantity, variantId, customisations, specialInstructions) {
        const cart = await this.getOrCreateCart(userId, sessionId);
        return this.dataSource.transaction(async (manager) => {
            const product = await manager.findOne(product_entity_1.Product, {
                where: { id: productId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!product)
                throw new common_1.NotFoundException('Product not found');
            if (!product.isAvailable) {
                throw new common_1.BadRequestException('This product is currently unavailable');
            }
            if (product.stockCount > 0 && product.stockCount < quantity) {
                throw new common_1.BadRequestException(`Only ${product.stockCount} unit(s) available for ${product.name}`);
            }
            let variantName;
            let additionalPrice = 0;
            if (variantId) {
                const variant = product.variants?.find((v) => v.id === variantId);
                if (!variant)
                    throw new common_1.BadRequestException('Variant not found on this product');
                variantName = `${variant.type}: ${variant.name}`;
                additionalPrice = Number(variant.additionalPrice);
            }
            const unitPrice = Number(product.basePrice) + additionalPrice;
            const existing = await manager.findOne(cart_item_entity_1.CartItem, {
                where: { cartId: cart.id, productId, variantId: variantId ?? (0, typeorm_2.IsNull)() },
            });
            if (existing) {
                const newQty = existing.quantity + quantity;
                if (product.stockCount > 0 && product.stockCount < newQty) {
                    throw new common_1.BadRequestException(`Cannot add ${quantity} more — only ${product.stockCount - existing.quantity} additional unit(s) available`);
                }
                existing.quantity = newQty;
                await manager.save(cart_item_entity_1.CartItem, existing);
            }
            else {
                const item = manager.create(cart_item_entity_1.CartItem, {
                    cartId: cart.id,
                    productId,
                    productName: product.name,
                    unitPrice,
                    quantity,
                    variantId,
                    variantName,
                    customisations,
                    specialInstructions,
                });
                await manager.save(cart_item_entity_1.CartItem, item);
            }
            if (product.stockCount > 0) {
                await manager.decrement(product_entity_1.Product, { id: productId }, 'stockCount', quantity);
            }
            return this.getCartById(cart.id);
        }).then(async (updatedCart) => {
            if (userId) {
                await this.abandonedCartService.scheduleRecovery(updatedCart.id, userId);
            }
            return updatedCart;
        });
    }
    async updateItemQuantity(cartItemId, quantity, userId, sessionId) {
        return this.dataSource.transaction(async (manager) => {
            const item = await manager.findOne(cart_item_entity_1.CartItem, {
                where: { id: cartItemId },
                relations: ['cart'],
            });
            if (!item)
                throw new common_1.NotFoundException('Cart item not found');
            const cart = item.cart;
            if (userId && cart.userId !== userId)
                throw new common_1.NotFoundException('Cart item not found');
            if (sessionId && cart.sessionId !== sessionId)
                throw new common_1.NotFoundException('Cart item not found');
            const product = await manager.findOne(product_entity_1.Product, {
                where: { id: item.productId },
                lock: { mode: 'pessimistic_write' },
            });
            const diff = quantity - item.quantity;
            if (quantity <= 0) {
                if (product && product.stockCount >= 0) {
                    await manager.increment(product_entity_1.Product, { id: item.productId }, 'stockCount', item.quantity);
                }
                await manager.remove(cart_item_entity_1.CartItem, item);
            }
            else {
                if (product && product.stockCount > 0 && diff > 0 && product.stockCount < diff) {
                    throw new common_1.BadRequestException(`Only ${product.stockCount} additional unit(s) available`);
                }
                if (product && product.stockCount >= 0 && diff !== 0) {
                    if (diff > 0) {
                        await manager.decrement(product_entity_1.Product, { id: item.productId }, 'stockCount', diff);
                    }
                    else {
                        await manager.increment(product_entity_1.Product, { id: item.productId }, 'stockCount', Math.abs(diff));
                    }
                }
                item.quantity = quantity;
                await manager.save(cart_item_entity_1.CartItem, item);
            }
            return this.getCartById(cart.id);
        });
    }
    async removeItem(cartItemId, userId, sessionId) {
        return this.dataSource.transaction(async (manager) => {
            const item = await manager.findOne(cart_item_entity_1.CartItem, {
                where: { id: cartItemId },
                relations: ['cart'],
            });
            if (!item)
                throw new common_1.NotFoundException('Cart item not found');
            const cart = item.cart;
            if (userId && cart.userId !== userId)
                throw new common_1.NotFoundException('Cart item not found');
            if (sessionId && cart.sessionId !== sessionId)
                throw new common_1.NotFoundException('Cart item not found');
            await manager.increment(product_entity_1.Product, { id: item.productId }, 'stockCount', item.quantity);
            await manager.remove(cart_item_entity_1.CartItem, item);
            return this.getCartById(cart.id);
        });
    }
    async clearCart(userId, sessionId) {
        return this.dataSource.transaction(async (manager) => {
            const where = userId ? { userId } : { sessionId };
            const cart = await this.cartRepo.findOne({ where, relations: ['items'] });
            if (!cart || !cart.items?.length)
                return true;
            for (const item of cart.items) {
                await manager.increment(product_entity_1.Product, { id: item.productId }, 'stockCount', item.quantity);
            }
            await manager.remove(cart_item_entity_1.CartItem, cart.items);
            return true;
        });
    }
    async mergeGuestCart(sessionId, userId) {
        const guestCart = await this.cartRepo.findOne({
            where: { sessionId },
            relations: ['items'],
        });
        if (!guestCart || !guestCart.items?.length) {
            return this.getOrCreateCart(userId);
        }
        const userCart = await this.getOrCreateCart(userId);
        for (const guestItem of guestCart.items) {
            const existing = userCart.items?.find((i) => i.productId === guestItem.productId && i.variantId === guestItem.variantId);
            if (existing) {
                existing.quantity += guestItem.quantity;
                await this.cartItemRepo.save(existing);
            }
            else {
                const newItem = this.cartItemRepo.create({
                    ...guestItem,
                    id: undefined,
                    cartId: userCart.id,
                });
                await this.cartItemRepo.save(newItem);
            }
        }
        await this.cartRepo.remove(guestCart);
        return this.getCartById(userCart.id);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService,
        typeorm_2.DataSource,
        abandoned_cart_service_1.AbandonedCartService])
], CartService);
//# sourceMappingURL=cart.service.js.map