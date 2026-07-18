import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';

export enum CustomPaymentMethod {
  PAYSTACK = 'PAYSTACK',
  MANUAL_TRANSFER = 'MANUAL_TRANSFER',
}

export enum CustomPaymentStatus {
  PENDING = 'PENDING',
  PROOF_UPLOADED = 'PROOF_UPLOADED', // manual transfer proof uploaded
  CONFIRMED = 'CONFIRMED',           // admin confirmed manual transfer
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

registerEnumType(CustomPaymentMethod, { name: 'CustomPaymentMethod' });
registerEnumType(CustomPaymentStatus, { name: 'CustomPaymentStatus' });

@ObjectType()
@Entity('custom_order_payments')
export class CustomOrderPayment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  requestId: string;

  @Field(() => ID)
  @Column()
  agreementId: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Field(() => CustomPaymentMethod)
  @Column({ type: 'enum', enum: CustomPaymentMethod })
  method: CustomPaymentMethod;

  @Field(() => CustomPaymentStatus)
  @Column({
    type: 'enum',
    enum: CustomPaymentStatus,
    default: CustomPaymentStatus.PENDING,
  })
  status: CustomPaymentStatus;

  // ─── Paystack fields ───────────────────────────────────────────────────────

  @Field({ nullable: true })
  @Column({ nullable: true })
  paystackReference?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paystackTransactionId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  authorizationUrl?: string;

  // ─── Manual transfer fields ────────────────────────────────────────────────

  @Field({ nullable: true })
  @Column({ nullable: true })
  transferProofUrl?: string; // customer uploads bank receipt screenshot

  @Field({ nullable: true })
  @Column({ nullable: true })
  transferProofKey?: string; // S3 key

  @Field({ nullable: true })
  @Column({ nullable: true })
  transferReference?: string; // bank transaction reference from customer

  @Field({ nullable: true })
  @Column({ nullable: true })
  confirmedBy?: string; // admin userId who confirmed the transfer

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  confirmedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  adminNote?: string;

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