export declare enum ReviewStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    FLAGGED = "FLAGGED"
}
export declare class Review {
    id: string;
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    comment?: string;
    mediaUrls: string[];
    mediaKeys: string[];
    status: ReviewStatus;
    adminResponse?: string;
    respondedBy?: string;
    respondedAt?: Date;
    flagReason?: string;
    isVerifiedPurchase: boolean;
    createdAt: Date;
    updatedAt: Date;
}
