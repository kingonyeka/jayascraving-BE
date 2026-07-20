import { InAppNotificationsService } from './in-app-notifications.service';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
declare const PaginatedNotifications_base: abstract new () => {
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedNotifications extends PaginatedNotifications_base {
}
declare class NotificationSummary {
    unreadCount: number;
}
export declare class InAppNotificationsResolver {
    private readonly service;
    constructor(service: InAppNotificationsService);
    myNotifications(user: User, pagination?: PaginationInput): Promise<PaginatedNotifications>;
    notificationSummary(user: User): Promise<NotificationSummary>;
    markNotificationRead(user: User, notificationId: string): Promise<Notification>;
    markAllNotificationsRead(user: User): Promise<number>;
    deleteNotification(user: User, notificationId: string): Promise<boolean>;
    clearReadNotifications(user: User): Promise<number>;
}
export {};
