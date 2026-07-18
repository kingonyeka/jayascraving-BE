import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';
import { ProductMedia } from '../products/entities/product-media.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

// REQUEST scope — new DataLoader instance per request
// this ensures batching happens within a single request only
@Injectable({ scope: Scope.REQUEST })
export class ProductLoader {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ProductMedia) private readonly mediaRepo: Repository<ProductMedia>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  // ─── Batch load products by ID ─────────────────────────────────────────────
  // Instead of N queries for N products, fires ONE query with WHERE id IN (...)

  readonly byId = new DataLoader<string, Product | null>(
    async (ids: readonly string[]) => {
      const products = await this.productRepo.find({
        where: { id: In([...ids]) },
      });
      const map = new Map(products.map((p) => [p.id, p]));
      return ids.map((id) => map.get(id) ?? null);
    },
    { cache: true }, // cache within the same request
  );

  // ─── Batch load categories by ID ──────────────────────────────────────────

  readonly categoryById = new DataLoader<string, Category | null>(
    async (ids: readonly string[]) => {
      const categories = await this.categoryRepo.find({
        where: { id: In([...ids]) },
      });
      const map = new Map(categories.map((c) => [c.id, c]));
      return ids.map((id) => map.get(id) ?? null);
    },
    { cache: true },
  );

  // ─── Batch load media by productId ────────────────────────────────────────

  readonly mediaByProductId = new DataLoader<string, ProductMedia[]>(
    async (productIds: readonly string[]) => {
      const media = await this.mediaRepo.find({
        where: { productId: In([...productIds]) },
        order: { sortOrder: 'ASC' },
      });
      const map = new Map<string, ProductMedia[]>();
      for (const m of media) {
        if (!map.has(m.productId)) map.set(m.productId, []);
        map.get(m.productId)!.push(m);
      }
      return productIds.map((id) => map.get(id) ?? []);
    },
    { cache: true },
  );

  // ─── Batch load variants by productId ─────────────────────────────────────

  readonly variantsByProductId = new DataLoader<string, ProductVariant[]>(
    async (productIds: readonly string[]) => {
      const variants = await this.variantRepo.find({
        where: { productId: In([...productIds]) },
      });
      const map = new Map<string, ProductVariant[]>();
      for (const v of variants) {
        if (!map.has(v.productId)) map.set(v.productId, []);
        map.get(v.productId)!.push(v);
      }
      return productIds.map((id) => map.get(id) ?? []);
    },
    { cache: true },
  );
}