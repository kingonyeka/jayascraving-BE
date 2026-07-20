import { OrderStatus } from '../../../common/enums/order-status.enum';
export interface OrderStatusUpdateData {
    customerName: string;
    orderNumber: string;
    status: OrderStatus;
    message?: string;
}
export declare function orderStatusUpdateTemplate(data: OrderStatusUpdateData): {
    subject: string;
    html: string;
};
