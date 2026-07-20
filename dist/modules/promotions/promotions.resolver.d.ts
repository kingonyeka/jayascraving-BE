import { PromotionsService } from './promotions.service';
import { PromoCode, DiscountType } from './entities/promo-code.entity';
import { PromoUsage } from './entities/promo-usage.entity';
import { User } from '../users/entities/user.entity';
declare class PromoValidationResult {
    promoCode: PromoCode;
    discountAmount: number;
    finalTotal: number;
}
declare class BroadcastPromotionResult {
    promoCode: PromoCode;
    notifiedCount: number;
}
export declare class PromotionsResolver {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    validatePromoCode(user: User, code: string, orderSubtotal: number, deliveryFee: number): Promise<PromoValidationResult>;
    promoCodes(): Promise<PromoCode[]>;
    promoCode(id: string): Promise<PromoCode>;
    promoUsageHistory(promoCodeId: string): Promise<PromoUsage[]>;
    createPromoCode(user: User, code: string, discountType: DiscountType, discountValue: number, description?: string, minimumOrderValue?: number, maximumDiscount?: number, usageLimit?: number, perUserLimit?: number, startsAt?: string, expiresAt?: string): Promise<PromoCode>;
    togglePromoCode(id: string): Promise<PromoCode>;
    deletePromoCode(id: string): Promise<boolean>;
    broadcastPromoCode(promoCodeId: string, title: string, body: string): Promise<BroadcastPromotionResult>;
}
export {};
