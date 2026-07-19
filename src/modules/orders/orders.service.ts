import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order, DeliveryType } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { CartService } from '../cart/cart.service';
import { QueuesService } from '../queues/queues.service';
import { StaffService } from '../staff/staff.service';
import { PromotionsService } from '../promotions/promotions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AbandonedCartService } from '../abandoned-cart/abandoned-cart.service';
import { RealTimeAnalyticsService } from '../real-time-analytics/real-time-analytics.service';
import { InAppNotificationsService } from '../in-app-notifications/in-app-notifications.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { OrderFilterInput } from './dto/order-filter.input';
import { PaginationInput } from '../../common/types/pagination.type';
import { buildPaginatedResult, IPaginatedResult } from '../../common/types/paginated-result.type';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly cartService: CartService,
    private readonly queuesService: QueuesService,
    private readonly staffService: StaffService,
    private readonly promotionsService: PromotionsService,
    private readonly notificationsService: NotificationsService,
    private readonly abandonedCartService: AbandonedCartService,
    private readonly realTimeAnalyticsService: RealTimeAnalyticsService,
    private readonly inAppNotificationsService: InAppNotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  // Previously `JC-${(await orderRepo.count()) + 1}`, which has a
  // read-then-use race condition: two concurrent checkouts could read the
  // same count before either inserted, producing duplicate order numbers.
  // A Postgres sequence (see migrations/*-AddOrderNumberSequence.ts)
  // guarantees atomic, collision-free numbers under concurrency.
  private async generateOrderNumber(): Promise<string> {
    const [{ nextval }] = await this.orderRepo.query(
      `SELECT nextval('order_number_seq') as nextval`,
    );
    return `JC-${String(nextval).padStart(6, '0')}`;
  }

  async createFromCart(userId: string, input: CreateOrderInput): Promise<Order> {
    const cart = await this.cartService.getOrCreateCart(userId);

    if (!cart.items?.length) throw new BadRequestException('Your cart is empty');

    if (
      input.deliveryType === DeliveryType.DELIVERY &&
      (!input.deliveryStreet || !input.deliveryCity || !input.deliveryState)
    ) {
      throw new BadRequestException('Delivery address is required for delivery orders');
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity, 0,
    );
    const deliveryFee = input.deliveryType === DeliveryType.DELIVERY ? 2000 : 0;

    // Order creation, order items, and (if present) promo-code validation +
    // usage recording all happen inside one transaction now. Previously
    // these were separate, unguarded calls — a failure partway through
    // (e.g. order item insert failing) could leave a saved Order with zero
    // items, and promo codes were never actually applied to the total at
    // all (`discount` was hardcoded to 0 and PromotionsService was never
    // called from here).
    const savedOrder = await this.dataSource.transaction(async (manager) => {
      let discount: number;
      let promoCodeId: string | undefined;

      const orderNumber = await this.generateOrderNumber();

      const order = manager.create(Order, {
        orderNumber, userId,
        status: OrderStatus.PENDING,
        deliveryType: input.deliveryType,
        subtotal, deliveryFee, discount: 0, total: subtotal + deliveryFee,
        promoCode: input.promoCode,
        deliveryAddressId: input.deliveryAddressId,
        deliveryRecipientName: input.deliveryRecipientName,
        deliveryPhone: input.deliveryPhone,
        deliveryStreet: input.deliveryStreet,
        deliveryCity: input.deliveryCity,
        deliveryState: input.deliveryState,
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
        deliveryTimeSlot: input.deliveryTimeSlot,
        notes: input.notes,
      });

      let saved = await manager.save(Order, order);

      if (input.promoCode) {
        const promoResult = await this.promotionsService.applyAndRecordUsage(
          manager, input.promoCode, userId, saved.id, subtotal, deliveryFee,
        );
        discount = promoResult.discountAmount;
        promoCodeId = promoResult.promoCode.id;
        saved.discount = discount;
        saved.total = Math.max(0, subtotal + deliveryFee - discount);
        saved.promoCodeId = promoCodeId;
        saved = await manager.save(Order, saved);
      }

      const orderItems = cart.items.map((cartItem) =>
        manager.create(OrderItem, {
          orderId: saved.id,
          productId: cartItem.productId,
          productName: cartItem.productName,
          unitPrice: cartItem.unitPrice,
          quantity: cartItem.quantity,
          totalPrice: Number(cartItem.unitPrice) * cartItem.quantity,
          variantId: cartItem.variantId,
          variantName: cartItem.variantName,
          customisations: cartItem.customisations,
          specialInstructions: cartItem.specialInstructions,
        }),
      );
      await manager.save(OrderItem, orderItems);

      return saved;
    });

    await this.cartService.clearCart(userId);

    // Cancel the pending abandoned-cart recovery email — the user actually
    // checked out. Previously AbandonedCartService.cancelRecovery() existed
    // with a comment saying to call it here, but nothing did, so a customer
    // could still receive a "you left something in your cart" email for a
    // cart they'd already paid for.
    await this.abandonedCartService.cancelRecovery(cart.id);

    // schedule auto-cancel after 30 minutes
    await this.queuesService.scheduleAutoCancel(savedOrder.id, 30 * 60 * 1000);

    // schedule delivery reminder day before
    if (savedOrder.deliveryDate) {
      const reminderTime = new Date(savedOrder.deliveryDate);
      reminderTime.setDate(reminderTime.getDate() - 1);
      const delay = reminderTime.getTime() - Date.now();
      if (delay > 0) {
        await this.queuesService.scheduleDeliveryReminder(savedOrder.id, userId, delay);
      }
    }

    // Order confirmation email — previously NotificationsService.
    // sendOrderConfirmation() was fully implemented but never called from
    // anywhere, so customers never received a confirmation.
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      await this.notificationsService.sendOrderConfirmation(user.email, {
        customerName: user.fullName,
        orderNumber: savedOrder.orderNumber,
        orderItems: cart.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          price: Number(i.unitPrice),
        })),
        subtotal,
        deliveryFee,
        discount: savedOrder.discount,
        total: savedOrder.total,
        deliveryType: savedOrder.deliveryType,
      });
    }

    // Live admin dashboard — previously RealTimeAnalyticsModule was marked
    // @Global() specifically so it could be injected here, but never was.
    this.realTimeAnalyticsService.emitNewOrder({
      id: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      total: savedOrder.total,
      userId,
    });

    return this.findById(savedOrder.id);
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { orderNumber }, relations: ['items'] });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(
    userId: string,
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<Order>> {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async findAll(
    filter: OrderFilterInput = {},
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<Order>> {
    const qb = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.createdAt', 'DESC');

    if (filter.status) qb.andWhere('order.status = :status', { status: filter.status });
    if (filter.deliveryType) qb.andWhere('order.deliveryType = :deliveryType', { deliveryType: filter.deliveryType });
    if (filter.userId) qb.andWhere('order.userId = :userId', { userId: filter.userId });
    if (filter.search) qb.andWhere('order.orderNumber ILIKE :search', { search: `%${filter.search}%` });
    if (filter.fromDate) qb.andWhere('order.createdAt >= :fromDate', { fromDate: new Date(filter.fromDate) });
    if (filter.toDate) qb.andWhere('order.createdAt <= :toDate', { toDate: new Date(filter.toDate) });

    qb.skip(pagination.skip).take(pagination.limit);
    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async updateStatus(
    input: UpdateOrderStatusInput,
    adminId: string,
    adminName: string,
  ): Promise<Order> {
    const order = await this.findById(input.orderId);
    const before = { status: order.status };

    order.status = input.status;
    if (input.adminNotes) order.adminNotes = input.adminNotes;
    const saved = await this.orderRepo.save(order);

    // cancel auto-cancel job when payment confirmed
    if (input.status === OrderStatus.CONFIRMED && before.status === OrderStatus.PENDING) {
      await this.queuesService.cancelAutoCancel(order.id);
    }

    // audit log every status change
    await this.staffService.logAction(
      adminId, adminName,
      'UPDATE_ORDER_STATUS', 'Order', order.id,
      before, { status: input.status, adminNotes: input.adminNotes },
    );

    // Notify the customer of the status change — previously
    // sendOrderStatusUpdate(), notifyOrderStatus() (in-app), and
    // notifyOrderStatus() (push) were all fully built but had zero callers.
    if (before.status !== saved.status) {
      const user = await this.userRepo.findOne({ where: { id: saved.userId } });
      if (user) {
        await this.notificationsService.sendOrderStatusUpdate(user.email, {
          customerName: user.fullName,
          orderNumber: saved.orderNumber,
          status: saved.status,
        });

        await this.inAppNotificationsService.notifyOrderStatus(
          user.id, saved.orderNumber, saved.id, saved.status,
        );

        if (user.fcmToken) {
          await this.pushNotificationsService.notifyOrderStatus(
            user.fcmToken, saved.orderNumber, saved.status, saved.id,
          );
        }
      }

      this.realTimeAnalyticsService.emitOrderStatusChanged({
        id: saved.id,
        orderNumber: saved.orderNumber,
        status: saved.status,
      });
    }

    return saved;
  }

  async cancel(orderId: string, userId: string): Promise<Order> {
    const order = await this.findById(orderId);
    if (order.userId !== userId) throw new BadRequestException('You can only cancel your own orders');

    const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(`Order cannot be cancelled at status: ${order.status}`);
    }

    order.status = OrderStatus.CANCELLED;
    const saved = await this.orderRepo.save(order);
    await this.queuesService.cancelAutoCancel(orderId);
    return saved;
  }

  async reorder(orderId: string, userId: string): Promise<Order> {
    const originalOrder = await this.findById(orderId);
    if (originalOrder.userId !== userId) throw new BadRequestException('Order not found');

    for (const item of originalOrder.items) {
      await this.cartService.addItem(
        userId, undefined, item.productId, item.quantity,
        item.variantId, item.customisations, item.specialInstructions,
      );
    }

    return this.createFromCart(userId, {
      deliveryType: originalOrder.deliveryType,
      deliveryAddressId: originalOrder.deliveryAddressId,
      deliveryRecipientName: originalOrder.deliveryRecipientName,
      deliveryPhone: originalOrder.deliveryPhone,
      deliveryStreet: originalOrder.deliveryStreet,
      deliveryCity: originalOrder.deliveryCity,
      deliveryState: originalOrder.deliveryState,
    });
  }
}
