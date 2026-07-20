export interface PaymentReceiptData {
    customerName: string;
    orderNumber: string;
    amount: number;
    paymentReference: string;
    paymentMethod: string;
    paidAt: string;
}
export declare function paymentReceiptTemplate(data: PaymentReceiptData): {
    subject: string;
    html: string;
};
