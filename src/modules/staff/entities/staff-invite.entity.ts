import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType, Field, ID, HideField, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../../../common/enums/user-role.enum';

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

registerEnumType(InviteStatus, { name: 'InviteStatus' });

@ObjectType()
@Entity('staff_invites')
export class StaffInvite {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index()
  @Column()
  email: string;

  @Field()
  @Column()
  fullName: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ nullable: true })
  department?: string;

  // Secret credential — never expose over GraphQL. Previously carried
  // @Field(), which put the raw invite token in the schema and meant any
  // query returning a StaffInvite (e.g. an admin invite list) leaked it.
  @HideField()
  @Index({ unique: true })
  @Column()
  token: string; // unique invite token sent in the email link

  @Field(() => InviteStatus)
  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  @Field()
  @Column({ type: 'timestamptz' })
  expiresAt: Date; // 48 hours from creation

  @Field()
  @Column()
  invitedBy: string; // admin userId

  @Field({ nullable: true })
  @Column({ nullable: true })
  acceptedBy?: string; // userId created on acceptance

  @Field({ nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}