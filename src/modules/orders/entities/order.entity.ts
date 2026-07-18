import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { OrderItem } from './order-item.entity';

export enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  USSD = 'USSD',
  PAY_WITH_TRANSFER = 'PAY_WITH_TRANSFER',
}

import { registerEnumType } from '@nestjs/graphql';

registerEnumType(DeliveryType, { name: 'DeliveryType' });
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@ObjectType()
@Entity('orders')
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index({ unique: true })
  @Column()
  orderNumber: string; // human-readable e.g. "JC-20260001"

  @Field(() => ID)
  @Index()
  @Column()
  userId: string;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Field(() => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Field(() => DeliveryType)
  @Column({ type: 'enum', enum: DeliveryType })
  deliveryType: DeliveryType;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  promoCode?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  promoCodeId?: string;

  // ─── Delivery details ──────────────────────────────────────────────────────

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryAddressId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryRecipientName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryPhone?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryStreet?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryCity?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryState?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliverySlotId?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  deliveryDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryTimeSlot?: string; // e.g. "10:00 - 12:00"

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentReference?: string; // Paystack reference

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentId?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  adminNotes?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}