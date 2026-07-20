import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderItem } from './order-item.entity';
export declare enum DeliveryType {
    DELIVERY = "DELIVERY",
    PICKUP = "PICKUP"
}
export declare enum PaymentMethod {
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    USSD = "USSD",
    PAY_WITH_TRANSFER = "PAY_WITH_TRANSFER"
}
export declare class Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    status: OrderStatus;
    deliveryType: DeliveryType;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    promoCode?: string;
    promoCodeId?: string;
    deliveryAddressId?: string;
    deliveryRecipientName?: string;
    deliveryPhone?: string;
    deliveryStreet?: string;
    deliveryCity?: string;
    deliveryState?: string;
    deliverySlotId?: string;
    deliveryDate?: Date;
    deliveryTimeSlot?: string;
    paymentReference?: string;
    paymentId?: string;
    notes?: string;
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
