import { Order } from './order.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    productId: string;
    productName: string;
    productSlug?: string;
    productImageUrl?: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    variantId?: string;
    variantName?: string;
    customisations?: string;
    specialInstructions?: string;
    createdAt: Date;
}
