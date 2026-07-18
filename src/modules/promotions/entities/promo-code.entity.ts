import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREE_DELIVERY = 'FREE_DELIVERY',
}

registerEnumType(DiscountType, {
  name: 'DiscountType',
  description: 'Type of discount applied by a promo code',
});

@ObjectType()
@Entity('promo_codes')
export class PromoCode {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index({ unique: true })
  @Column()
  code: string; // e.g. "CAKE20", "FREESHIP"

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => DiscountType)
  @Column({ type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountValue: number; // % for PERCENTAGE, ₦ for FIXED, 0 for FREE_DELIVERY

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minimumOrderValue?: number; // minimum cart total to use this code

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscount?: number; // cap for PERCENTAGE discounts e.g. max ₦5000 off

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  usageLimit?: number; // total number of times code can be used (null = unlimited)

  @Field(() => Int)
  @Column({ default: 0 })
  usageCount: number; // how many times it has been used

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  perUserLimit?: number; // max uses per customer (null = unlimited)

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  startsAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  createdBy?: string; // admin userId

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}