import { Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
export declare class OrderLoader {
    private readonly orderRepo;
    private readonly itemRepo;
    constructor(orderRepo: Repository<Order>, itemRepo: Repository<OrderItem>);
    readonly byId: DataLoader<string, Order, string>;
    readonly itemsByOrderId: DataLoader<string, OrderItem[], string>;
    readonly byUserId: DataLoader<string, Order[], string>;
}
