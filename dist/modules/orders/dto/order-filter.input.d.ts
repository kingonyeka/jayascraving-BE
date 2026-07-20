import { OrderStatus } from '../../../common/enums/order-status.enum';
import { DeliveryType } from '../entities/order.entity';
export declare class OrderFilterInput {
    status?: OrderStatus;
    deliveryType?: DeliveryType;
    fromDate?: string;
    toDate?: string;
    userId?: string;
    search?: string;
}
