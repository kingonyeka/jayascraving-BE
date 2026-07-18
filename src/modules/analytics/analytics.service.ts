import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
  ) {}

  // ─── Revenue overview ──────────────────────────────────────────────────────

  async getRevenueOverview(from: Date, to: Date) {
    const result = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .addSelect('COUNT(payment.id)', 'count')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.paidAt BETWEEN :from AND :to', { from, to })
      .getRawOne();

    return {
      totalRevenue: Number(result?.total ?? 0),
      totalTransactions: Number(result?.count ?? 0),
    };
  }

  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly', from: Date, to: Date) {
    const trunc =
      period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month';

    const results = await this.paymentRepo
      .createQueryBuilder('payment')
      .select(`DATE_TRUNC('${trunc}', payment.paidAt)`, 'period')
      .addSelect('SUM(payment.amount)', 'revenue')
      .addSelect('COUNT(payment.id)', 'transactions')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.paidAt BETWEEN :from AND :to', { from, to })
      .groupBy(`DATE_TRUNC('${trunc}', payment.paidAt)`)
      .orderBy(`DATE_TRUNC('${trunc}', payment.paidAt)`, 'ASC')
      .getRawMany();

    return results.map((r) => ({
      period: r.period,
      revenue: Number(r.revenue),
      transactions: Number(r.transactions),
    }));
  }

  // ─── Order stats ───────────────────────────────────────────────────────────

  async getOrderStats(from: Date, to: Date) {
    const total = await this.orderRepo.count({
      where: { createdAt: Between(from, to) },
    });

    const byStatus = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('order.status')
      .getRawMany();

    const delivered = byStatus.find((s) => s.status === OrderStatus.DELIVERED);
    const cancelled = byStatus.find((s) => s.status === OrderStatus.CANCELLED);

    const fulfilmentRate =
      total > 0
        ? Math.round((Number(delivered?.count ?? 0) / total) * 100)
        : 0;

    const avgOrderValue = await this.orderRepo
      .createQueryBuilder('order')
      .select('AVG(order.total)', 'avg')
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .getRawOne();

    return {
      totalOrders: total,
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: Number(s.count),
      })),
      fulfilmentRate,
      cancelledOrders: Number(cancelled?.count ?? 0),
      averageOrderValue: Math.round(Number(avgOrderValue?.avg ?? 0)),
    };
  }

  // ─── Top selling products ──────────────────────────────────────────────────

  async getTopProducts(from: Date, to: Date, limit = 10) {
    return this.orderItemRepo
      .createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .select('item.productId', 'productId')
      .addSelect('item.productName', 'productName')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('order.status != :cancelled', { cancelled: OrderStatus.CANCELLED })
      .groupBy('item.productId')
      .addGroupBy('item.productName')
      .orderBy('SUM(item.quantity)', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // ─── Customer stats ────────────────────────────────────────────────────────

  async getCustomerStats(from: Date, to: Date) {
    const totalCustomers = await this.userRepo.count();

    const newCustomers = await this.userRepo.count({
      where: { createdAt: Between(from, to) },
    });

    const returningCustomers = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.userId', 'userId')
      .where('order.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('order.userId')
      .having('COUNT(order.id) > 1')
      .getCount();

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
    };
  }

  // ─── Abandoned cart count ──────────────────────────────────────────────────

  async getAbandonedCartCount(): Promise<number> {
    // carts with items but no corresponding completed order
    const result = await this.cartRepo
      .createQueryBuilder('cart')
      .innerJoin('cart.items', 'items')
      .where('cart.userId IS NOT NULL')
      .getCount();

    return result;
  }

  // ─── Dashboard summary (all in one) ───────────────────────────────────────

  async getDashboardSummary(from: Date, to: Date) {
    const [revenue, orders, customers, abandonedCarts, topProducts] =
      await Promise.all([
        this.getRevenueOverview(from, to),
        this.getOrderStats(from, to),
        this.getCustomerStats(from, to),
        this.getAbandonedCartCount(),
        this.getTopProducts(from, to, 5),
      ]);

    return {
      revenue,
      orders,
      customers,
      abandonedCarts,
      topProducts,
    };
  }
}