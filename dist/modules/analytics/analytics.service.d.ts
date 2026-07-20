import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
export declare class AnalyticsService {
    private readonly orderRepo;
    private readonly orderItemRepo;
    private readonly userRepo;
    private readonly paymentRepo;
    private readonly cartRepo;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, userRepo: Repository<User>, paymentRepo: Repository<Payment>, cartRepo: Repository<Cart>);
    getRevenueOverview(from: Date, to: Date): Promise<{
        totalRevenue: number;
        totalTransactions: number;
    }>;
    getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly', from: Date, to: Date): Promise<{
        period: any;
        revenue: number;
        transactions: number;
    }[]>;
    getOrderStats(from: Date, to: Date): Promise<{
        totalOrders: number;
        byStatus: {
            status: any;
            count: number;
        }[];
        fulfilmentRate: number;
        cancelledOrders: number;
        averageOrderValue: number;
    }>;
    getTopProducts(from: Date, to: Date, limit?: number): Promise<any[]>;
    getCustomerStats(from: Date, to: Date): Promise<{
        totalCustomers: number;
        newCustomers: number;
        returningCustomers: number;
    }>;
    getAbandonedCartCount(): Promise<number>;
    getDashboardSummary(from: Date, to: Date): Promise<{
        revenue: {
            totalRevenue: number;
            totalTransactions: number;
        };
        orders: {
            totalOrders: number;
            byStatus: {
                status: any;
                count: number;
            }[];
            fulfilmentRate: number;
            cancelledOrders: number;
            averageOrderValue: number;
        };
        customers: {
            totalCustomers: number;
            newCustomers: number;
            returningCustomers: number;
        };
        abandonedCarts: number;
        topProducts: any[];
    }>;
}
