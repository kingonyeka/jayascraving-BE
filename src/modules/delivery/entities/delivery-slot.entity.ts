import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
@Entity('delivery_slots')
export class DeliverySlot {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  label: string; // e.g. "Morning (9am - 12pm)"

  @Field()
  @Column()
  startTime: string; // e.g. "09:00"

  @Field()
  @Column()
  endTime: string; // e.g. "12:00"

  @Field(() => Int)
  @Column({ default: 10 })
  maxOrders: number; // max orders allowed in this slot per day

  @Field(() => [String])
  @Column({ type: 'jsonb', default: '["MON","TUE","WED","THU","FRI","SAT","SUN"]' })
  availableDays: string[]; // which days this slot is offered

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