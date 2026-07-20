export declare class CustomOrderAgreement {
    id: string;
    requestId: string;
    quoteId: string;
    agreementNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    cakeDescription: string;
    agreedLineItems: string[];
    agreedTotal: number;
    agreedDeliveryDate?: Date;
    deliveryMethod?: string;
    pdfUrl?: string;
    pdfKey?: string;
    customerSigned: boolean;
    adminSigned: boolean;
    createdAt: Date;
}
