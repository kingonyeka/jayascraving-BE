export declare enum QuoteStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    SUPERSEDED = "SUPERSEDED"
}
export declare class CustomOrderQuote {
    id: string;
    requestId: string;
    version: number;
    totalAmount: number;
    lineItems: string[];
    message?: string;
    terms?: string;
    validUntil?: Date;
    status: QuoteStatus;
    customerResponse?: string;
    respondedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
