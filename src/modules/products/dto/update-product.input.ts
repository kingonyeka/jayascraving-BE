import { Field, InputType, Float, Int, ID } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

@InputType()
export class UpdateProductInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockCount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  // ─── Media (add or replace) ────────────────────────────────────────────────
  // Same key/url pairing as CreateProductInput. By default new media is
  // appended after whatever the product already has. Set replaceMedia: true
  // to delete the product's existing media first (e.g. the admin re-shot
  // the product photos and wants a clean slate).
  @Field(() => [String], { nullable: true, description: 'S3 object keys to add, in display order.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  mediaKeys?: string[];

  @Field(() => [String], { nullable: true, description: 'CDN URLs, parallel to mediaKeys (same index = same file).' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  mediaUrls?: string[];

  @Field({ nullable: true, defaultValue: false, description: 'If true, delete existing media before adding the new mediaKeys/mediaUrls.' })
  @IsOptional()
  @IsBoolean()
  replaceMedia?: boolean;
}