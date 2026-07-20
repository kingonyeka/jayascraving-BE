export declare enum NotificationType {
    ORDER_STATUS = "ORDER_STATUS",
    PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
    PAYMENT_FAILED = "PAYMENT_FAILED",
    CUSTOM_ORDER_QUOTE = "CUSTOM_ORDER_QUOTE",
    CUSTOM_ORDER_AGREEMENT = "CUSTOM_ORDER_AGREEMENT",
    REVIEW_RESPONSE = "REVIEW_RESPONSE",
    PROMOTION = "PROMOTION",
    DELIVERY_REMINDER = "DELIVERY_REMINDER",
    SYSTEM = "SYSTEM"
}
export declare class Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    referenceId?: string;
    referenceType?: string;
    actionUrl?: string;
    imageUrl?: string;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
}
