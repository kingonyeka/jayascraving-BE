import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Order } from './order.entity';

@ObjectType()
@Entity('order_items')
export class OrderItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @Field(() => ID)
  @Column()
  productId: string;

  @Field()
  @Column()
  productName: string; // snapshot

  @Field({ nullable: true })
  @Column({ nullable: true })
  productSlug?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  productImageUrl?: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // snapshot

  @Field(() => Int)
  @Column()
  quantity: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  variantId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  variantName?: string;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  customisations?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  specialInstructions?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}