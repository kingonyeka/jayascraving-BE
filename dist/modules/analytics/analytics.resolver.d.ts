import { AnalyticsService } from './analytics.service';
declare class RevenueOverview {
    totalRevenue: number;
    totalTransactions: number;
}
declare class RevenuePeriod {
    period: string;
    revenue: number;
    transactions: number;
}
declare class OrderStatusCount {
    status: string;
    count: number;
}
declare class OrderStats {
    totalOrders: number;
    byStatus: OrderStatusCount[];
    fulfilmentRate: number;
    cancelledOrders: number;
    averageOrderValue: number;
}
declare class TopProduct {
    productId: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
}
declare class CustomerStats {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
}
declare class DashboardSummary {
    revenue: RevenueOverview;
    orders: OrderStats;
    customers: CustomerStats;
    abandonedCarts: number;
    topProducts: TopProduct[];
}
export declare class AnalyticsResolver {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    dashboardSummary(from: string, to: string): Promise<DashboardSummary>;
    revenueOverview(from: string, to: string): Promise<RevenueOverview>;
    revenueByPeriod(period: string, from: string, to: string): Promise<RevenuePeriod[]>;
    orderStats(from: string, to: string): Promise<OrderStats>;
    topProducts(from: string, to: string, limit: number): Promise<TopProduct[]>;
    customerStats(from: string, to: string): Promise<CustomerStats>;
    abandonedCarts(): Promise<number>;
}
export {};
