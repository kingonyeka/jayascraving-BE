import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

export const CacheKeys = {
  // products
  PRODUCT_ALL: 'products:all',
  PRODUCT_FEATURED: 'products:featured',
  PRODUCT_BY_ID: (id: string) => `product:${id}`,
  PRODUCT_BY_SLUG: (slug: string) => `product:slug:${slug}`,
  PRODUCT_BY_CATEGORY: (categoryId: string) => `products:category:${categoryId}`,

  // categories
  CATEGORIES_ALL: 'categories:all',
  CATEGORY_BY_ID: (id: string) => `category:${id}`,

  // settings
  SETTINGS_PUBLIC: 'settings:public',
  SETTING_BY_KEY: (key: string) => `setting:${key}`,

  // analytics
  ANALYTICS_DASHBOARD: (from: string, to: string) => `analytics:dashboard:${from}:${to}`,
  ANALYTICS_TOP_PRODUCTS: (from: string, to: string) => `analytics:top-products:${from}:${to}`,

  // delivery
  DELIVERY_ZONES: 'delivery:zones',
  DELIVERY_SLOTS: 'delivery:slots',
};

export const CacheTTL = {
  PRODUCT: 300,        // 5 minutes — products change occasionally
  CATEGORY: 600,       // 10 minutes — categories rarely change
  SETTINGS: 300,       // 5 minutes
  ANALYTICS: 120,      // 2 minutes — near-real-time dashboard
  DELIVERY: 600,       // 10 minutes — delivery zones rarely change
  SHORT: 60,           // 1 minute — frequently changing data
};

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  // ─── Core get/set/del ──────────────────────────────────────────────────────

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cache.get<T>(key) ?? null;
    } catch (error: any) {
      this.logger.warn(`Cache GET failed for key "${key}": ${error?.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      await this.cache.set(key, value, ttl * 1000); // cache-manager uses ms
    } catch (error: any) {
      this.logger.warn(`Cache SET failed for key "${key}": ${error?.message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cache.del(key);
      this.logger.debug(`Cache invalidated: ${key}`);
    } catch (error: any) {
      this.logger.warn(`Cache DEL failed for key "${key}": ${error?.message}`);
    }
  }

  // ─── Pattern invalidation ──────────────────────────────────────────────────

  async delMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.del(key)));
  }

  // ─── Get or set (cache-aside pattern) ────────────────────────────────────

  async wrap<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  // ─── Product cache invalidation ───────────────────────────────────────────

  async invalidateProduct(productId: string, slug?: string, categoryId?: string) {
    const keys = [
      CacheKeys.PRODUCT_ALL,
      CacheKeys.PRODUCT_FEATURED,
      CacheKeys.PRODUCT_BY_ID(productId),
    ];
    if (slug) keys.push(CacheKeys.PRODUCT_BY_SLUG(slug));
    if (categoryId) keys.push(CacheKeys.PRODUCT_BY_CATEGORY(categoryId));
    await this.delMany(keys);
    this.logger.log(`Product cache invalidated for product: ${productId}`);
  }

  async invalidateAllProducts() {
    await this.delMany([
      CacheKeys.PRODUCT_ALL,
      CacheKeys.PRODUCT_FEATURED,
    ]);
  }

  // ─── Category cache invalidation ─────────────────────────────────────────

  async invalidateCategory(categoryId: string) {
    await this.delMany([
      CacheKeys.CATEGORIES_ALL,
      CacheKeys.CATEGORY_BY_ID(categoryId),
      CacheKeys.PRODUCT_BY_CATEGORY(categoryId),
    ]);
    this.logger.log(`Category cache invalidated: ${categoryId}`);
  }

  // ─── Settings cache invalidation ─────────────────────────────────────────

  async invalidateSetting(key: string) {
    await this.delMany([
      CacheKeys.SETTINGS_PUBLIC,
      CacheKeys.SETTING_BY_KEY(key),
    ]);
    this.logger.log(`Settings cache invalidated: ${key}`);
  }

  // ─── Delivery cache invalidation ─────────────────────────────────────────

  async invalidateDelivery() {
    await this.delMany([
      CacheKeys.DELIVERY_ZONES,
      CacheKeys.DELIVERY_SLOTS,
    ]);
  }

  // ─── Analytics cache invalidation ────────────────────────────────────────

  async invalidateAnalytics() {
    // analytics keys are dynamic — we log but can't pattern-delete without Redis SCAN
    // use short TTL instead (2 minutes) so they auto-expire quickly
    this.logger.debug('Analytics cache will expire on next TTL cycle');
  }
}