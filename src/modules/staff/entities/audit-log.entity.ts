import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity('audit_logs')
export class AuditLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Index()
  @Column()
  performedBy: string; // staff/admin userId

  @Field()
  @Column()
  performedByName: string; // snapshot of name

  @Field()
  @Column()
  action: string; // e.g. "UPDATE_ORDER_STATUS", "DELETE_PRODUCT", "APPROVE_REVIEW"

  @Field()
  @Column()
  entity: string; // e.g. "Order", "Product", "Review"

  @Field({ nullable: true })
  @Column({ nullable: true })
  entityId?: string; // the ID of the affected record

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  before?: string; // JSON snapshot of state before change

  @Field({ nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  after?: string; // JSON snapshot of state after change

  @Field({ nullable: true })
  @Column({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userAgent?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}