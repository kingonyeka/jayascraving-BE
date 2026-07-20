import { OrderStatus } from '../../../common/enums/order-status.enum';
export declare class UpdateOrderStatusInput {
    orderId: string;
    status: OrderStatus;
    adminNotes?: string;
}
