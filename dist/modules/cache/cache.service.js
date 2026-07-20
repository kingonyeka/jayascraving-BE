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
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = exports.CacheTTL = exports.CacheKeys = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
exports.CacheKeys = {
    PRODUCT_ALL: 'products:all',
    PRODUCT_FEATURED: 'products:featured',
    PRODUCT_BY_ID: (id) => `product:${id}`,
    PRODUCT_BY_SLUG: (slug) => `product:slug:${slug}`,
    PRODUCT_BY_CATEGORY: (categoryId) => `products:category:${categoryId}`,
    CATEGORIES_ALL: 'categories:all',
    CATEGORY_BY_ID: (id) => `category:${id}`,
    SETTINGS_PUBLIC: 'settings:public',
    SETTING_BY_KEY: (key) => `setting:${key}`,
    ANALYTICS_DASHBOARD: (from, to) => `analytics:dashboard:${from}:${to}`,
    ANALYTICS_TOP_PRODUCTS: (from, to) => `analytics:top-products:${from}:${to}`,
    DELIVERY_ZONES: 'delivery:zones',
    DELIVERY_SLOTS: 'delivery:slots',
};
exports.CacheTTL = {
    PRODUCT: 300,
    CATEGORY: 600,
    SETTINGS: 300,
    ANALYTICS: 120,
    DELIVERY: 600,
    SHORT: 60,
};
let CacheService = CacheService_1 = class CacheService {
    constructor(cache) {
        this.cache = cache;
        this.logger = new common_1.Logger(CacheService_1.name);
    }
    async get(key) {
        try {
            return await this.cache.get(key) ?? null;
        }
        catch (error) {
            this.logger.warn(`Cache GET failed for key "${key}": ${error?.message}`);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            await this.cache.set(key, value, ttl * 1000);
        }
        catch (error) {
            this.logger.warn(`Cache SET failed for key "${key}": ${error?.message}`);
        }
    }
    async del(key) {
        try {
            await this.cache.del(key);
            this.logger.debug(`Cache invalidated: ${key}`);
        }
        catch (error) {
            this.logger.warn(`Cache DEL failed for key "${key}": ${error?.message}`);
        }
    }
    async delMany(keys) {
        await Promise.all(keys.map((key) => this.del(key)));
    }
    async wrap(key, ttl, fn) {
        const cached = await this.get(key);
        if (cached !== null) {
            this.logger.debug(`Cache HIT: ${key}`);
            return cached;
        }
        this.logger.debug(`Cache MISS: ${key}`);
        const result = await fn();
        await this.set(key, result, ttl);
        return result;
    }
    async invalidateProduct(productId, slug, categoryId) {
        const keys = [
            exports.CacheKeys.PRODUCT_ALL,
            exports.CacheKeys.PRODUCT_FEATURED,
            exports.CacheKeys.PRODUCT_BY_ID(productId),
        ];
        if (slug)
            keys.push(exports.CacheKeys.PRODUCT_BY_SLUG(slug));
        if (categoryId)
            keys.push(exports.CacheKeys.PRODUCT_BY_CATEGORY(categoryId));
        await this.delMany(keys);
        this.logger.log(`Product cache invalidated for product: ${productId}`);
    }
    async invalidateAllProducts() {
        await this.delMany([
            exports.CacheKeys.PRODUCT_ALL,
            exports.CacheKeys.PRODUCT_FEATURED,
        ]);
    }
    async invalidateCategory(categoryId) {
        await this.delMany([
            exports.CacheKeys.CATEGORIES_ALL,
            exports.CacheKeys.CATEGORY_BY_ID(categoryId),
            exports.CacheKeys.PRODUCT_BY_CATEGORY(categoryId),
        ]);
        this.logger.log(`Category cache invalidated: ${categoryId}`);
    }
    async invalidateSetting(key) {
        await this.delMany([
            exports.CacheKeys.SETTINGS_PUBLIC,
            exports.CacheKeys.SETTING_BY_KEY(key),
        ]);
        this.logger.log(`Settings cache invalidated: ${key}`);
    }
    async invalidateDelivery() {
        await this.delMany([
            exports.CacheKeys.DELIVERY_ZONES,
            exports.CacheKeys.DELIVERY_SLOTS,
        ]);
    }
    async invalidateAnalytics() {
        this.logger.debug('Analytics cache will expire on next TTL cycle');
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], CacheService);
//# sourceMappingURL=cache.service.js.map