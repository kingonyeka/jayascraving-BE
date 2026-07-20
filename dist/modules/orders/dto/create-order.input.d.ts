import { DeliveryType } from '../entities/order.entity';
export declare class CreateOrderInput {
    deliveryType: DeliveryType;
    deliveryAddressId?: string;
    deliveryRecipientName?: string;
    deliveryPhone?: string;
    deliveryStreet?: string;
    deliveryCity?: string;
    deliveryState?: string;
    deliveryDate?: string;
    deliveryTimeSlot?: string;
    promoCode?: string;
    notes?: string;
}
