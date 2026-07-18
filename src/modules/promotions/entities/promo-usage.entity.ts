import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
@Entity('promo_usage')
export class PromoUsage {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  promoCodeId: string;

  @Field(() => ID)
  @Index()
  @Column()
  userId: string;

  @Field(() => ID)
  @Column()
  orderId: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountApplied: number; // actual ₦ amount discounted

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}