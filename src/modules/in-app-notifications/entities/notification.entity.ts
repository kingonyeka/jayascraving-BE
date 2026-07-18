import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  ORDER_STATUS = 'ORDER_STATUS',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CUSTOM_ORDER_QUOTE = 'CUSTOM_ORDER_QUOTE',
  CUSTOM_ORDER_AGREEMENT = 'CUSTOM_ORDER_AGREEMENT',
  REVIEW_RESPONSE = 'REVIEW_RESPONSE',
  PROMOTION = 'PROMOTION',
  DELIVERY_REMINDER = 'DELIVERY_REMINDER',
  SYSTEM = 'SYSTEM',
}

registerEnumType(NotificationType, { name: 'NotificationType' });

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  userId: string;

  @Field(() => NotificationType)
  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ type: 'text' })
  body: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  referenceId?: string; // orderId, customOrderId etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  referenceType?: string; // 'Order', 'CustomOrder', 'Review'

  @Field({ nullable: true })
  @Column({ nullable: true })
  actionUrl?: string; // deep link for frontend e.g. /orders/123

  @Field({ nullable: true })
  @Column({ nullable: true })
  imageUrl?: string;

  @Field()
  @Column({ default: false })
  isRead: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}