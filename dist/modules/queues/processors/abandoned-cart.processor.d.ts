import { Job } from 'bull';
import { AbandonedCartService } from '../../abandoned-cart/abandoned-cart.service';
export declare class AbandonedCartProcessor {
    private readonly abandonedCartService;
    private readonly logger;
    constructor(abandonedCartService: AbandonedCartService);
    handleSendRecovery(job: Job<{
        cartId: string;
        userId: string;
    }>): Promise<void>;
    handleCartCleanup(_job: Job): Promise<{
        cleaned: number;
    }>;
}
