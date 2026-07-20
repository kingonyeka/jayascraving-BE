import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { IPaginatedResult } from '../../common/types/paginated-result.type';
export declare class InAppNotificationsService {
    private readonly notificationRepo;
    constructor(notificationRepo: Repository<Notification>);
    create(userId: string, type: NotificationType, title: string, body: string, options?: {
        referenceId?: string;
        referenceType?: string;
        actionUrl?: string;
        imageUrl?: string;
    }): Promise<Notification>;
    getForUser(userId: string, pagination?: PaginationInput): Promise<IPaginatedResult<Notification>>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<Notification>;
    markAllAsRead(userId: string): Promise<number>;
    delete(notificationId: string, userId: string): Promise<boolean>;
    clearRead(userId: string): Promise<number>;
    notifyOrderStatus(userId: string, orderNumber: string, orderId: string, status: string): Promise<void>;
    notifyPaymentSuccess(userId: string, orderNumber: string, orderId: string, amount: number): Promise<void>;
    notifyCustomOrderQuote(userId: string, requestNumber: string, requestId: string): Promise<void>;
    notifyPromotion(userIds: string[], title: string, body: string): Promise<void>;
}
