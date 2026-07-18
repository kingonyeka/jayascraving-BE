import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

registerEnumType(ReviewStatus, {
  name: 'ReviewStatus',
  description: 'Moderation status of a product review',
});

@ObjectType()
@Entity('reviews')
export class Review {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  userId: string;

  @Field(() => ID)
  @Index()
  @Column()
  productId: string;

  @Field(() => ID)
  @Index()
  @Column()
  orderId: string; // review must be tied to a real order

  @Field(() => Int)
  @Column({ type: 'int' })
  rating: number; // 1–5

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '[]' })
  mediaUrls: string[]; // customer uploaded review photos

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '[]' })
  mediaKeys: string[]; // S3 keys

  @Field(() => ReviewStatus)
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  adminResponse?: string; // admin/business response to review

  @Field({ nullable: true })
  @Column({ nullable: true })
  respondedBy?: string; // admin userId who responded

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  respondedAt?: Date;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  flagReason?: string; // reason for flagging

  @Field()
  @Column({ default: false })
  isVerifiedPurchase: boolean; // always true since we tie to orderId

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}