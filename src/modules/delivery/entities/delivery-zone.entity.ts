import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
@Entity('delivery_zones')
export class DeliveryZone {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string; // e.g. "Lagos Island", "Lagos Mainland", "Abuja"

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '[]' })
  areas: string[]; // list of LGAs / areas covered e.g. ["Lekki", "Victoria Island"]

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deliveryFee: number;

  @Field()
  @Column({ default: true })
  isActive: boolean;

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