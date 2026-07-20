import { QueuesService } from './queues.service';
import { QueueStatsResult } from './dto/queue-stats.type';
export declare class QueuesResolver {
    private readonly queuesService;
    constructor(queuesService: QueuesService);
    queueStats(): Promise<QueueStatsResult>;
}
