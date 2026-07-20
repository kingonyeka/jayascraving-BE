import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
export interface DashboardEvent {
    type: 'NEW_ORDER' | 'ORDER_STATUS_CHANGED' | 'PAYMENT_RECEIVED' | 'NEW_CUSTOMER' | 'REVENUE_UPDATE' | 'HEARTBEAT';
    payload: Record<string, any>;
    timestamp: string;
}
export declare class RealTimeAnalyticsService {
    private readonly orderRepo;
    private readonly paymentRepo;
    private readonly userRepo;
    private readonly logger;
    private readonly eventSubject;
    constructor(orderRepo: Repository<Order>, paymentRepo: Repository<Payment>, userRepo: Repository<User>);
    getEventStream(): import("rxjs").Observable<DashboardEvent>;
    emitNewOrder(order: {
        id: string;
        orderNumber: string;
        total: number;
        userId: string;
    }): void;
    emitOrderStatusChanged(order: {
        id: string;
        orderNumber: string;
        status: string;
    }): void;
    emitPaymentReceived(payment: {
        id: string;
        amount: number;
        orderId: string;
    }): void;
    emitNewCustomer(user: {
        id: string;
        email: string;
    }): void;
    getLiveDashboardSnapshot(): Promise<{
        todayOrders: number;
        todayRevenue: number;
        pendingOrders: number;
        totalCustomers: number;
        timestamp: string;
    }>;
    private emit;
}
