import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Product } from './product.entity';

@ObjectType()
@Entity('customisation_options')
export class CustomisationOption {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (p) => p.customisationOptions, { onDelete: 'CASCADE' })
  product: Product;

  @Field()
  @Column()
  name: string; // e.g. "Message Inscription", "Tier Count", "Colour"

  @Field()
  @Column()
  type: string; // e.g. "text", "select", "number", "color"

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  options?: string; // JSON array of choices for "select" type e.g. ["Red","Blue"]

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  additionalPrice: number;

  @Field()
  @Column({ default: false })
  isRequired: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}