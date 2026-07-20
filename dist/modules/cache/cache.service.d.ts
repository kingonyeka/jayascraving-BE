import { Cache } from 'cache-manager';
export declare const CacheKeys: {
    PRODUCT_ALL: string;
    PRODUCT_FEATURED: string;
    PRODUCT_BY_ID: (id: string) => string;
    PRODUCT_BY_SLUG: (slug: string) => string;
    PRODUCT_BY_CATEGORY: (categoryId: string) => string;
    CATEGORIES_ALL: string;
    CATEGORY_BY_ID: (id: string) => string;
    SETTINGS_PUBLIC: string;
    SETTING_BY_KEY: (key: string) => string;
    ANALYTICS_DASHBOARD: (from: string, to: string) => string;
    ANALYTICS_TOP_PRODUCTS: (from: string, to: string) => string;
    DELIVERY_ZONES: string;
    DELIVERY_SLOTS: string;
};
export declare const CacheTTL: {
    PRODUCT: number;
    CATEGORY: number;
    SETTINGS: number;
    ANALYTICS: number;
    DELIVERY: number;
    SHORT: number;
};
export declare class CacheService {
    private readonly cache;
    private readonly logger;
    constructor(cache: Cache);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl: number): Promise<void>;
    del(key: string): Promise<void>;
    delMany(keys: string[]): Promise<void>;
    wrap<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T>;
    invalidateProduct(productId: string, slug?: string, categoryId?: string): Promise<void>;
    invalidateAllProducts(): Promise<void>;
    invalidateCategory(categoryId: string): Promise<void>;
    invalidateSetting(key: string): Promise<void>;
    invalidateDelivery(): Promise<void>;
    invalidateAnalytics(): Promise<void>;
}
