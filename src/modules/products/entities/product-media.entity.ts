import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Product } from './product.entity';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@ObjectType()
@Entity('product_media')
export class ProductMedia {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (p) => p.media, { onDelete: 'CASCADE' })
  product: Product;

  @Field()
  @Column()
  url: string; // CloudFront CDN URL

  @Field()
  @Column()
  key: string; // S3 object key

  @Field()
  @Column({ type: 'enum', enum: MediaType, default: MediaType.IMAGE })
  type: MediaType;

  @Field()
  @Column({ default: false })
  isPrimary: boolean; // main product thumbnail

  @Field(() => Int)
  @Column({ default: 0 })
  sortOrder: number;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}