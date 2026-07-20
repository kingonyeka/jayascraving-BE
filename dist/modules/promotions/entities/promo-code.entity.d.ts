export declare enum DiscountType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED",
    FREE_DELIVERY = "FREE_DELIVERY"
}
export declare class PromoCode {
    id: string;
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderValue?: number;
    maximumDiscount?: number;
    usageLimit?: number;
    usageCount: number;
    perUserLimit?: number;
    isActive: boolean;
    startsAt?: Date;
    expiresAt?: Date;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
