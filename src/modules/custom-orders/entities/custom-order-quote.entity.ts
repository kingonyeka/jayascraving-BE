import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';

export enum QuoteStatus {
  PENDING = 'PENDING',     // sent, awaiting customer response
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  SUPERSEDED = 'SUPERSEDED', // replaced by a newer quote in negotiation
}

registerEnumType(QuoteStatus, { name: 'QuoteStatus' });

@ObjectType()
@Entity('custom_order_quotes')
export class CustomOrderQuote {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  requestId: string;

  @Field(() => Int)
  @Column({ default: 1 })
  version: number; // quote v1, v2, v3 for negotiation rounds

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '[]' })
  lineItems: string[]; // JSON array of { description, amount }

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  message?: string; // admin message to customer explaining the quote

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  terms?: string; // payment terms, revision policy etc.

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  validUntil?: Date; // quote expiry

  @Field(() => QuoteStatus)
  @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.PENDING })
  status: QuoteStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  customerResponse?: string; // customer's message when accepting/rejecting

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  respondedAt?: Date;

  @Field()
  @Column()
  createdBy: string; // admin userId who created this quote

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}