import { Job } from 'bull';
import { Repository } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class OrderProcessor {
    private readonly orderRepo;
    private readonly userRepo;
    private readonly notificationsService;
    private readonly logger;
    constructor(orderRepo: Repository<Order>, userRepo: Repository<User>, notificationsService: NotificationsService);
    handleAutoCancel(job: Job<{
        orderId: string;
    }>): Promise<void>;
    handleDeliveryReminder(job: Job<{
        orderId: string;
        userEmail: string;
    }>): Promise<void>;
}
