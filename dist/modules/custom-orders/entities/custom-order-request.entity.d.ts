export declare enum CustomOrderStatus {
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    QUOTE_SENT = "QUOTE_SENT",
    NEGOTIATING = "NEGOTIATING",
    QUOTE_ACCEPTED = "QUOTE_ACCEPTED",
    PAYMENT_PENDING = "PAYMENT_PENDING",
    PAID = "PAID",
    IN_PRODUCTION = "IN_PRODUCTION",
    BAKING = "BAKING",
    READY = "READY",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    REJECTED = "REJECTED"
}
export declare class CustomOrderRequest {
    id: string;
    requestNumber: string;
    userId: string;
    occasion: string;
    description?: string;
    approximateBudget?: string;
    preferredDeliveryDate?: Date;
    preferredDeliveryTime?: string;
    mediaUrls: string[];
    mediaKeys: string[];
    status: CustomOrderStatus;
    customerNotes?: string;
    adminNotes?: string;
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
}
