import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { OrderFilterInput } from './dto/order-filter.input';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
declare const PaginatedOrders_base: abstract new () => {
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedOrders extends PaginatedOrders_base {
}
export declare class OrdersResolver {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    myOrders(user: User, pagination?: PaginationInput): Promise<PaginatedOrders>;
    order(id: string): Promise<Order>;
    orderByNumber(orderNumber: string): Promise<Order>;
    allOrders(filter?: OrderFilterInput, pagination?: PaginationInput): Promise<PaginatedOrders>;
    createOrder(user: User, input: CreateOrderInput): Promise<Order>;
    cancelOrder(user: User, orderId: string): Promise<Order>;
    reorder(user: User, orderId: string): Promise<Order>;
    updateOrderStatus(user: User, input: UpdateOrderStatusInput): Promise<Order>;
}
export {};
