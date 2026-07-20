export declare class QueueJobCounts {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
}
export declare class QueueStatsResult {
    order: QueueJobCounts;
    payment: QueueJobCounts;
    inventory: QueueJobCounts;
    cart: QueueJobCounts;
}
