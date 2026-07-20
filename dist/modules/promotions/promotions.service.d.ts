import { Repository, EntityManager } from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';
import { PromoUsage } from './entities/promo-usage.entity';
import { User } from '../users/entities/user.entity';
import { InAppNotificationsService } from '../in-app-notifications/in-app-notifications.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
export interface ApplyPromoResult {
    promoCode: PromoCode;
    discountAmount: number;
    finalTotal: number;
}
export declare class PromotionsService {
    private readonly promoRepo;
    private readonly usageRepo;
    private readonly userRepo;
    private readonly inAppNotificationsService;
    private readonly pushNotificationsService;
    constructor(promoRepo: Repository<PromoCode>, usageRepo: Repository<PromoUsage>, userRepo: Repository<User>, inAppNotificationsService: InAppNotificationsService, pushNotificationsService: PushNotificationsService);
    applyPromoCode(code: string, userId: string, orderSubtotal: number, deliveryFee: number): Promise<ApplyPromoResult>;
    applyAndRecordUsage(manager: EntityManager, code: string, userId: string, orderId: string, orderSubtotal: number, deliveryFee: number): Promise<ApplyPromoResult>;
    private validateAndCalculate;
    create(data: Partial<PromoCode>, adminUserId: string): Promise<PromoCode>;
    update(id: string, data: Partial<PromoCode>): Promise<PromoCode>;
    delete(id: string): Promise<boolean>;
    findById(id: string): Promise<PromoCode>;
    findAll(): Promise<PromoCode[]>;
    getUsageHistory(promoCodeId: string): Promise<PromoUsage[]>;
    toggleActive(id: string): Promise<PromoCode>;
    broadcastPromotion(promoCodeId: string, title: string, body: string): Promise<{
        promoCode: PromoCode;
        notifiedCount: number;
    }>;
}
