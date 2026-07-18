import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export enum SettingType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

registerEnumType(SettingType, { name: 'SettingType' });

@ObjectType()
@Entity('settings')
export class Setting {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Index({ unique: true })
  @Column()
  key: string; // e.g. "business.name", "delivery.flat_fee", "tax.rate"

  @Field()
  @Column({ type: 'text' })
  value: string; // always stored as string, parsed based on type

  @Field(() => SettingType)
  @Column({ type: 'enum', enum: SettingType, default: SettingType.STRING })
  type: SettingType;

  @Field({ nullable: true })
  @Column({ nullable: true })
  label: string; // human-readable label e.g. "Business Name"

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  group?: string; // e.g. "business", "delivery", "tax", "email", "payment"

  @Field()
  @Column({ default: false })
  isSecret: boolean; // if true, value is masked in responses

  @Field()
  @Column({ default: true })
  isEditable: boolean; // some settings are read-only

  @Field({ nullable: true })
  @Column({ nullable: true })
  updatedBy?: string; // admin userId who last updated

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}