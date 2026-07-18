import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Cart } from './cart.entity';

@ObjectType()
@Entity('cart_items')
export class CartItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @Field(() => ID)
  @Column()
  productId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  productName: string; // snapshot at time of adding

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // snapshot at time of adding

  @Field(() => Int)
  @Column({ default: 1 })
  quantity: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  variantId?: string; // selected variant if any

  @Field({ nullable: true })
  @Column({ nullable: true })
  variantName?: string; // snapshot e.g. "6 inch / Chocolate"

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  customisations?: string; // JSON of selected customisation options

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  specialInstructions?: string;

  @Field(() => Float)
  get totalPrice(): number {
    return Number(this.unitPrice) * this.quantity;
  }

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}