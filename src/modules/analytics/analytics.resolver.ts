import { Resolver, Query, Args, ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

// ─── Response types ────────────────────────────────────────────────────────

@ObjectType()
class RevenueOverview {
  @Field(() => Float) totalRevenue: number;
  @Field(() => Int) totalTransactions: number;
}

@ObjectType()
class RevenuePeriod {
  @Field() period: string;
  @Field(() => Float) revenue: number;
  @Field(() => Int) transactions: number;
}

@ObjectType()
class OrderStatusCount {
  @Field() status: string;
  @Field(() => Int) count: number;
}

@ObjectType()
class OrderStats {
  @Field(() => Int) totalOrders: number;
  @Field(() => [OrderStatusCount]) byStatus: OrderStatusCount[];
  @Field(() => Int) fulfilmentRate: number;
  @Field(() => Int) cancelledOrders: number;
  @Field(() => Float) averageOrderValue: number;
}

@ObjectType()
class TopProduct {
  @Field() productId: string;
  @Field() productName: string;
  @Field(() => Int) totalSold: number;
  @Field(() => Float) totalRevenue: number;
}

@ObjectType()
class CustomerStats {
  @Field(() => Int) totalCustomers: number;
  @Field(() => Int) newCustomers: number;
  @Field(() => Int) returningCustomers: number;
}

@ObjectType()
class DashboardSummary {
  @Field(() => RevenueOverview) revenue: RevenueOverview;
  @Field(() => OrderStats) orders: OrderStats;
  @Field(() => CustomerStats) customers: CustomerStats;
  @Field(() => Int) abandonedCarts: number;
  @Field(() => [TopProduct]) topProducts: TopProduct[];
}

// ─── Resolver ──────────────────────────────────────────────────────────────

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SALES)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => DashboardSummary, { description: 'Admin: get full dashboard summary' })
  async dashboardSummary(
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<DashboardSummary> {
    return this.analyticsService.getDashboardSummary(
      new Date(from),
      new Date(to),
    ) as any;
  }

  @Query(() => RevenueOverview, { description: 'Admin: get revenue overview for a date range' })
  async revenueOverview(
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<RevenueOverview> {
    return this.analyticsService.getRevenueOverview(new Date(from), new Date(to));
  }

  @Query(() => [RevenuePeriod], { description: 'Admin: get revenue broken down by period (daily/weekly/monthly)' })
  async revenueByPeriod(
    @Args('period') period: string,
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<RevenuePeriod[]> {
    return this.analyticsService.getRevenueByPeriod(
      period as 'daily' | 'weekly' | 'monthly',
      new Date(from),
      new Date(to),
    );
  }

  @Query(() => OrderStats, { description: 'Admin: get order statistics for a date range' })
  async orderStats(
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<OrderStats> {
    return this.analyticsService.getOrderStats(new Date(from), new Date(to)) as any;
  }

  @Query(() => [TopProduct], { description: 'Admin: get top selling products' })
  async topProducts(
    @Args('from') from: string,
    @Args('to') to: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<TopProduct[]> {
    return this.analyticsService.getTopProducts(new Date(from), new Date(to), limit);
  }

  @Query(() => CustomerStats, { description: 'Admin: get customer acquisition stats' })
  async customerStats(
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<CustomerStats> {
    return this.analyticsService.getCustomerStats(new Date(from), new Date(to));
  }

  @Query(() => Int, { description: 'Admin: get abandoned cart count' })
  async abandonedCarts(): Promise<number> {
    return this.analyticsService.getAbandonedCartCount();
  }
}