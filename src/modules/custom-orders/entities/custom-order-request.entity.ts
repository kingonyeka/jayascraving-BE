import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum CustomOrderStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  QUOTE_SENT = 'QUOTE_SENT',
  NEGOTIATING = 'NEGOTIATING',
  QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  IN_PRODUCTION = 'IN_PRODUCTION',
  BAKING = 'BAKING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}

registerEnumType(CustomOrderStatus, {
  name: 'CustomOrderStatus',
  description: 'Status of a custom cake order request',
});

@ObjectType()
@Entity('custom_order_requests')
export class CustomOrderRequest {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index({ unique: true })
  @Column()
  requestNumber: string; // e.g. "JC-CUS-000001"

  @Field(() => ID)
  @Index()
  @Column()
  userId: string;

  @Field()
  @Column()
  occasion: string; // e.g. "Birthday", "Wedding", "Anniversary"

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string; // customer description of what they want

  @Field({ nullable: true })
  @Column({ nullable: true })
  approximateBudget?: string; // e.g. "₦50,000 - ₦80,000"

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  preferredDeliveryDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  preferredDeliveryTime?: string;

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '[]' })
  mediaUrls: string[]; // S3/CloudFront URLs of uploaded images/videos

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '[]' })
  mediaKeys: string[]; // S3 keys for deletion

  @Field(() => CustomOrderStatus)
  @Column({
    type: 'enum',
    enum: CustomOrderStatus,
    default: CustomOrderStatus.SUBMITTED,
  })
  status: CustomOrderStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  customerNotes?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  adminNotes?: string; // internal notes, not visible to customer

  @Field({ nullable: true })
  @Column({ nullable: true })
  assignedTo?: string; // staff userId handling this request

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}