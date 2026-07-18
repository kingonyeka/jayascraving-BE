import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductMedia } from './product-media.entity';
import { CustomisationOption } from './customisation-option.entity';

@ObjectType()
@Entity('products')
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Index({ unique: true })
  @Column()
  slug: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Field({ nullable: true })
  @Column()
  categoryId: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @Field(() => [ProductVariant], { nullable: true })
  @OneToMany(() => ProductVariant, (v) => v.product, { cascade: true })
  variants: ProductVariant[];

  @Field(() => [ProductMedia], { nullable: true })
  @OneToMany(() => ProductMedia, (m) => m.product, { cascade: true })
  media: ProductMedia[];

  @Field(() => [CustomisationOption], { nullable: true })
  @OneToMany(() => CustomisationOption, (o) => o.product, { cascade: true })
  customisationOptions: CustomisationOption[];

  @Field()
  @Column({ default: true })
  isAvailable: boolean;

  @Field()
  @Column({ default: false })
  isFeatured: boolean;

  @Field(() => Int)
  @Column({ default: 0 })
  stockCount: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  metaTitle?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  metaDescription?: string;

  @Field()
  @Column({ default: 0 })
  sortOrder: number;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}