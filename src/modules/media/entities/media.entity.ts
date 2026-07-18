import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';

export enum MediaCategory {
  PRODUCT = 'PRODUCT',
  REVIEW = 'REVIEW',
  CUSTOM_ORDER = 'CUSTOM_ORDER',
  CUSTOM_ORDER_PROOF = 'CUSTOM_ORDER_PROOF',
  AVATAR = 'AVATAR',
  CATEGORY = 'CATEGORY',
}

export enum MediaFileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

registerEnumType(MediaCategory, { name: 'MediaCategory' });
registerEnumType(MediaFileType, { name: 'MediaFileType' });

@ObjectType()
@Entity('media')
export class Media {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  uploadedBy: string; // userId

  @Field()
  @Column()
  key: string; // S3 object key

  @Field()
  @Column()
  url: string; // CloudFront CDN URL

  @Field()
  @Column()
  originalName: string;

  @Field()
  @Column()
  mimeType: string;

  @Field(() => Int)
  @Column()
  size: number; // bytes

  @Field(() => MediaFileType)
  @Column({ type: 'enum', enum: MediaFileType })
  fileType: MediaFileType;

  @Field(() => MediaCategory)
  @Column({ type: 'enum', enum: MediaCategory })
  category: MediaCategory;

  @Field({ nullable: true })
  @Column({ nullable: true })
  referenceId?: string; // productId, orderId, reviewId etc.

  @Field({ nullable: true })
  @Column({ nullable: true })
  thumbnailUrl?: string; // generated thumbnail for videos

  @Field({ nullable: true })
  @Column({ nullable: true })
  thumbnailKey?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}