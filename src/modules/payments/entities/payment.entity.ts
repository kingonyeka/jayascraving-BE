import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, HideField } from '@nestjs/graphql';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { PaymentMethod } from '../../orders/entities/order.entity';

@ObjectType()
@Entity('payments')
export class Payment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  orderId: string;

  @Field(() => ID)
  @Index()
  @Column()
  userId: string;

  @Field()
  @Index({ unique: true })
  @Column()
  paystackReference: string; // unique ref sent to Paystack

  @Field({ nullable: true })
  @Column({ nullable: true })
  paystackTransactionId?: string; // returned by Paystack after success

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // in Naira

  @Field(() => PaymentStatus)
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Field(() => PaymentMethod, { nullable: true })
  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  method?: PaymentMethod;

  @Field({ nullable: true })
  @Column({ nullable: true })
  channel?: string; // e.g. "card", "bank_transfer" from Paystack response

  @Field({ nullable: true })
  @Column({ nullable: true })
  currency?: string; // NGN

  // Raw Paystack payload snapshot for internal audit/debugging — hidden
  // from the GraphQL schema (previously @Field()'d as a String even though
  // the column is jsonb and now stores an object, not a JSON string).
  @HideField()
  @Column({ type: 'jsonb', nullable: true })
  paystackMeta?: Record<string, any>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  failureReason?: string;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}