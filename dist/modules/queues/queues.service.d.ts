import { Queue } from 'bull';
export declare class QueuesService {
    private readonly orderQueue;
    private readonly paymentQueue;
    private readonly inventoryQueue;
    private readonly cartQueue;
    private readonly logger;
    constructor(orderQueue: Queue, paymentQueue: Queue, inventoryQueue: Queue, cartQueue: Queue);
    scheduleAutoCancel(orderId: string, delayMs: number): Promise<void>;
    cancelAutoCancel(orderId: string): Promise<void>;
    scheduleDeliveryReminder(orderId: string, userEmail: string, delayMs: number): Promise<void>;
    schedulePaymentVerify(reference: string, delayMs?: number): Promise<void>;
    schedulePaymentTimeout(paymentId: string, delayMs: number): Promise<void>;
    runLowStockCheck(): Promise<void>;
    scheduleStockUpdate(productId: string, quantity: number): Promise<void>;
    getQueueStats(): Promise<{
        order: import("bull").JobCounts;
        payment: import("bull").JobCounts;
        inventory: import("bull").JobCounts;
        cart: import("bull").JobCounts;
    }>;
}
