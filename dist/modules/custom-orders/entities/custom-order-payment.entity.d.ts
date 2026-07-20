export declare enum CustomPaymentMethod {
    PAYSTACK = "PAYSTACK",
    MANUAL_TRANSFER = "MANUAL_TRANSFER"
}
export declare enum CustomPaymentStatus {
    PENDING = "PENDING",
    PROOF_UPLOADED = "PROOF_UPLOADED",
    CONFIRMED = "CONFIRMED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class CustomOrderPayment {
    id: string;
    requestId: string;
    agreementId: string;
    amount: number;
    method: CustomPaymentMethod;
    status: CustomPaymentStatus;
    paystackReference?: string;
    paystackTransactionId?: string;
    authorizationUrl?: string;
    transferProofUrl?: string;
    transferProofKey?: string;
    transferReference?: string;
    confirmedBy?: string;
    confirmedAt?: Date;
    adminNote?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
