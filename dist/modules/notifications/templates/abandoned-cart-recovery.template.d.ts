export interface AbandonedCartRecoveryData {
    customerName: string;
    itemSummary: string;
    itemCount: number;
    cartTotal: number;
    checkoutUrl: string;
}
export declare function abandonedCartRecoveryTemplate(data: AbandonedCartRecoveryData): {
    subject: string;
    html: string;
};
