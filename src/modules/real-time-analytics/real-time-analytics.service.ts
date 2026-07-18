import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from 'rxjs';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';

export interface DashboardEvent {
  type:
    | 'NEW_ORDER'
    | 'ORDER_STATUS_CHANGED'
    | 'PAYMENT_RECEIVED'
    | 'NEW_CUSTOMER'
    | 'REVENUE_UPDATE'
    | 'HEARTBEAT';
  payload: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class RealTimeAnalyticsService {
  private readonly logger = new Logger(RealTimeAnalyticsService.name);

  // Subject is an RxJS observable that we push events into
  // Each connected SSE client subscribes to this
  private readonly eventSubject = new Subject<DashboardEvent>();

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  // ─── Subscribe to live events ──────────────────────────────────────────────
  // Returns an Observable that SSE controller subscribes to

  getEventStream() {
    return this.eventSubject.asObservable();
  }

  // ─── Emit events (called from other services) ──────────────────────────────

  emitNewOrder(order: { id: string; orderNumber: string; total: number; userId: string }) {
    this.emit({
      type: 'NEW_ORDER',
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        userId: order.userId,
      },
    });
  }

  emitOrderStatusChanged(order: { id: string; orderNumber: string; status: string }) {
    this.emit({
      type: 'ORDER_STATUS_CHANGED',
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      },
    });
  }

  emitPaymentReceived(payment: { id: string; amount: number; orderId: string }) {
    this.emit({
      type: 'PAYMENT_RECEIVED',
      payload: {
        paymentId: payment.id,
        amount: payment.amount,
        orderId: payment.orderId,
      },
    });
  }

  emitNewCustomer(user: { id: string; email: string }) {
    this.emit({
      type: 'NEW_CUSTOMER',
      payload: { userId: user.id, email: user.email },
    });
  }

  // ─── Live dashboard snapshot ───────────────────────────────────────────────
  // Called when a new SSE client connects to send them the current state

  async getLiveDashboardSnapshot() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      todayRevenue,
      pendingOrders,
      totalCustomers,
    ] = await Promise.all([
      this.orderRepo.count({ where: { createdAt: today as any } }),

      this.paymentRepo
        .createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: PaymentStatus.SUCCESS })
        .andWhere('p.paidAt >= :today', { today })
        .getRawOne(),

      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),

      this.userRepo.count(),
    ]);

    return {
      todayOrders,
      todayRevenue: Number(todayRevenue?.total ?? 0),
      pendingOrders,
      totalCustomers,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Private emit helper ───────────────────────────────────────────────────

  private emit(event: Omit<DashboardEvent, 'timestamp'>) {
    const fullEvent: DashboardEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    this.eventSubject.next(fullEvent);
    this.logger.debug(`SSE event emitted: ${event.type}`);
  }
}