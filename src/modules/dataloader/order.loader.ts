import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

@Injectable({ scope: Scope.REQUEST })
export class OrderLoader {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
  ) {}

  // ─── Batch load orders by ID ───────────────────────────────────────────────

  readonly byId = new DataLoader<string, Order | null>(
    async (ids: readonly string[]) => {
      const orders = await this.orderRepo.find({
        where: { id: In([...ids]) },
      });
      const map = new Map(orders.map((o) => [o.id, o]));
      return ids.map((id) => map.get(id) ?? null);
    },
    { cache: true },
  );

  // ─── Batch load order items by orderId ────────────────────────────────────

  readonly itemsByOrderId = new DataLoader<string, OrderItem[]>(
    async (orderIds: readonly string[]) => {
      const items = await this.itemRepo.find({
        where: { orderId: In([...orderIds]) },
      });
      const map = new Map<string, OrderItem[]>();
      for (const item of items) {
        if (!map.has(item.orderId)) map.set(item.orderId, []);
        map.get(item.orderId)!.push(item);
      }
      return orderIds.map((id) => map.get(id) ?? []);
    },
    { cache: true },
  );

  // ─── Batch load orders by userId ──────────────────────────────────────────

  readonly byUserId = new DataLoader<string, Order[]>(
    async (userIds: readonly string[]) => {
      const orders = await this.orderRepo.find({
        where: { userId: In([...userIds]) },
        order: { createdAt: 'DESC' },
      });
      const map = new Map<string, Order[]>();
      for (const order of orders) {
        if (!map.has(order.userId)) map.set(order.userId, []);
        map.get(order.userId)!.push(order);
      }
      return userIds.map((id) => map.get(id) ?? []);
    },
    { cache: true },
  );
}