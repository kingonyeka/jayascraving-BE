import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
@Entity('custom_order_agreements')
export class CustomOrderAgreement {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index({ unique: true })
  @Column()
  requestId: string;

  @Field(() => ID)
  @Column()
  quoteId: string; // the accepted quote

  @Field()
  @Column()
  agreementNumber: string; // e.g. "JC-AGR-000001"

  // ─── Snapshot of agreed details ────────────────────────────────────────────

  @Field()
  @Column()
  customerName: string;

  @Field()
  @Column()
  customerEmail: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customerPhone?: string;

  @Field()
  @Column({ type: 'text' })
  cakeDescription: string;

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '[]' })
  agreedLineItems: string[]; // JSON array snapshot

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  agreedTotal: number;

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  agreedDeliveryDate?: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryMethod?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  pdfUrl?: string; // CloudFront URL of generated agreement PDF

  @Field({ nullable: true })
  @Column({ nullable: true })
  pdfKey?: string; // S3 key

  @Field()
  @Column({ default: false })
  customerSigned: boolean;

  @Field()
  @Column({ default: false })
  adminSigned: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}