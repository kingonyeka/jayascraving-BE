import { Field, InputType, Float, Int } from '@nestjs/graphql';
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
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @Field()
  @IsUUID()
  categoryId: string;

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
  @MaxLength(200)
  metaTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  // ─── Media (attached atomically with the product) ────────────────────────
  // Client uploads each image via POST /api/media/presign + /api/media/confirm
  // first (getting back a `key`/`url` pair per file), then passes the S3
  // keys and their matching CDN URLs here so the product is created with its
  // photos already attached — no separate follow-up call needed.
  // mediaKeys[i] must correspond to mediaUrls[i] (same index, same file).
  @Field(() => [String], { nullable: true, description: 'S3 object keys, in display order. First entry becomes the primary image.' })
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
}