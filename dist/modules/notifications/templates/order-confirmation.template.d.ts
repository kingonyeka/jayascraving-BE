export interface OrderConfirmationData {
    customerName: string;
    orderNumber: string;
    orderItems: {
        name: string;
        quantity: number;
        price: number;
    }[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    deliveryType: string;
    deliveryDate?: string;
    deliveryAddress?: string;
}
export declare function orderConfirmationTemplate(data: OrderConfirmationData): {
    subject: string;
    html: string;
};
