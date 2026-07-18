import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { buildPaginatedResult, IPaginatedResult } from '../../common/types/paginated-result.type';

@Injectable()
export class InAppNotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  // ─── Create notification ───────────────────────────────────────────────────

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    options?: {
      referenceId?: string;
      referenceType?: string;
      actionUrl?: string;
      imageUrl?: string;
    },
  ): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId,
      type,
      title,
      body,
      ...options,
      isRead: false,
    });
    return this.notificationRepo.save(notification);
  }

  // ─── Get user notifications ────────────────────────────────────────────────

  async getForUser(
    userId: string,
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<Notification>> {
    const [data, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  // ─── Get unread count ──────────────────────────────────────────────────────

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }

  // ─── Mark single notification as read ─────────────────────────────────────

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepo.save(notification);
  }

  // ─── Mark all as read ──────────────────────────────────────────────────────

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return result.affected ?? 0;
  }

  // ─── Delete a notification ─────────────────────────────────────────────────

  async delete(notificationId: string, userId: string): Promise<boolean> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.notificationRepo.remove(notification);
    return true;
  }

  // ─── Delete all read notifications ────────────────────────────────────────

  async clearRead(userId: string): Promise<number> {
    const result = await this.notificationRepo.delete({ userId, isRead: true });
    return result.affected ?? 0;
  }

  // ─── Pre-built notification creators ──────────────────────────────────────

  async notifyOrderStatus(
    userId: string,
    orderNumber: string,
    orderId: string,
    status: string,
  ): Promise<void> {
    const messages: Record<string, { title: string; body: string }> = {
      CONFIRMED: { title: '✅ Order Confirmed', body: `Your order ${orderNumber} has been confirmed and is being prepared.` },
      BAKING: { title: '🔥 Baking in Progress', body: `Your cake for order ${orderNumber} is in the oven!` },
      READY: { title: '🎂 Order Ready!', body: `Your order ${orderNumber} is ready.` },
      OUT_FOR_DELIVERY: { title: '🚗 Out for Delivery', body: `Your order ${orderNumber} is on its way!` },
      DELIVERED: { title: '🎉 Delivered!', body: `Your order ${orderNumber} has been delivered. Enjoy every bite!` },
      CANCELLED: { title: '❌ Order Cancelled', body: `Your order ${orderNumber} has been cancelled.` },
    };

    const msg = messages[status];
    if (!msg) return;

    await this.create(userId, NotificationType.ORDER_STATUS, msg.title, msg.body, {
      referenceId: orderId,
      referenceType: 'Order',
      actionUrl: `/orders/${orderId}`,
    });
  }

  async notifyPaymentSuccess(userId: string, orderNumber: string, orderId: string, amount: number): Promise<void> {
    await this.create(
      userId,
      NotificationType.PAYMENT_SUCCESS,
      '💳 Payment Successful',
      `₦${amount.toLocaleString()} received for order ${orderNumber}.`,
      { referenceId: orderId, referenceType: 'Order', actionUrl: `/orders/${orderId}` },
    );
  }

  async notifyCustomOrderQuote(userId: string, requestNumber: string, requestId: string): Promise<void> {
    await this.create(
      userId,
      NotificationType.CUSTOM_ORDER_QUOTE,
      '📋 Quote Ready',
      `Your quote for request ${requestNumber} is ready. Tap to review and respond.`,
      { referenceId: requestId, referenceType: 'CustomOrder', actionUrl: `/custom-orders/${requestId}` },
    );
  }

  async notifyPromotion(userIds: string[], title: string, body: string): Promise<void> {
    const notifications = userIds.map((userId) =>
      this.notificationRepo.create({
        userId,
        type: NotificationType.PROMOTION,
        title,
        body,
        actionUrl: '/shop',
        isRead: false,
      }),
    );
    await this.notificationRepo.save(notifications);
  }
}