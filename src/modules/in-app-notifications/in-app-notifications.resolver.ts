import {
  Resolver, Query, Mutation, Args, ID, ObjectType, Field, Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InAppNotificationsService } from './in-app-notifications.service';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { PaginatedResult } from '../../common/types/paginated-result.type';

@ObjectType()
class PaginatedNotifications extends PaginatedResult(Notification) {}

@ObjectType()
class NotificationSummary {
  @Field(() => Int) unreadCount: number;
}

@Resolver()
@UseGuards(JwtAuthGuard)
export class InAppNotificationsResolver {
  constructor(private readonly service: InAppNotificationsService) {}

  @Query(() => PaginatedNotifications, { description: 'Get current user notifications' })
  myNotifications(
    @CurrentUser() user: User,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedNotifications> {
    return this.service.getForUser(user.id, pagination) as any;
  }

  @Query(() => NotificationSummary, { description: 'Get unread notification count' })
  async notificationSummary(@CurrentUser() user: User): Promise<NotificationSummary> {
    const unreadCount = await this.service.getUnreadCount(user.id);
    return { unreadCount };
  }

  @Mutation(() => Notification, { description: 'Mark a notification as read' })
  markNotificationRead(
    @CurrentUser() user: User,
    @Args('notificationId', { type: () => ID }) notificationId: string,
  ): Promise<Notification> {
    return this.service.markAsRead(notificationId, user.id);
  }

  @Mutation(() => Int, { description: 'Mark all notifications as read' })
  markAllNotificationsRead(@CurrentUser() user: User): Promise<number> {
    return this.service.markAllAsRead(user.id);
  }

  @Mutation(() => Boolean, { description: 'Delete a notification' })
  deleteNotification(
    @CurrentUser() user: User,
    @Args('notificationId', { type: () => ID }) notificationId: string,
  ): Promise<boolean> {
    return this.service.delete(notificationId, user.id);
  }

  @Mutation(() => Int, { description: 'Clear all read notifications' })
  clearReadNotifications(@CurrentUser() user: User): Promise<number> {
    return this.service.clearRead(user.id);
  }
}