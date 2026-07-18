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
import { CartItem } from './cart-item.entity';

@ObjectType()
@Entity('carts')
export class Cart {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  userId?: string; // null = guest cart

  @Field({ nullable: true })
  @Index()
  @Column({ nullable: true })
  sessionId?: string; // for guest carts

  @Field(() => [CartItem], { nullable: true })
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: true })
  items: CartItem[];

  @Field(() => Float)
  get subtotal(): number {
    if (!this.items?.length) return 0;
    return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}