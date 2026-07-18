import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
@Entity('order_customisations')
export class OrderCustomisation {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  orderItemId: string;

  @Field()
  @Column()
  optionName: string; // e.g. "Message Inscription"

  @Field()
  @Column()
  optionType: string; // e.g. "text"

  @Field()
  @Column()
  value: string; // e.g. "Happy Birthday John"

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  additionalPrice: number;
}