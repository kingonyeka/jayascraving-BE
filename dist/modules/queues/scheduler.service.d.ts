import { OnApplicationBootstrap } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { AbandonedCartService } from '../abandoned-cart/abandoned-cart.service';
export declare class SchedulerService implements OnApplicationBootstrap {
    private readonly queuesService;
    private readonly abandonedCartService;
    private readonly logger;
    constructor(queuesService: QueuesService, abandonedCartService: AbandonedCartService);
    onApplicationBootstrap(): Promise<void>;
    handleLowStockCheck(): Promise<void>;
}
