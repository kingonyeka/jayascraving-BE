import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import slugify from 'slugify';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductMedia, MediaType } from './entities/product-media.entity';
import { CustomisationOption } from './entities/customisation-option.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductFilterInput } from './dto/product-filter.input';
import { PaginationInput } from '../../common/types/pagination.type';
import { buildPaginatedResult, IPaginatedResult } from '../../common/types/paginated-result.type';
import { StaffService } from '../staff/staff.service';

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ProductVariant) private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ProductMedia) private readonly mediaRepo: Repository<ProductMedia>,
    @InjectRepository(CustomisationOption) private readonly optionRepo: Repository<CustomisationOption>,
    private readonly staffService: StaffService,
    private readonly dataSource: DataSource,
  ) {}

  private inferMediaType(key: string): MediaType {
    const ext = key.split('.').pop()?.toLowerCase() ?? '';
    return VIDEO_EXTENSIONS.includes(ext) ? MediaType.VIDEO : MediaType.IMAGE;
  }

  /** Validates the mediaKeys[]/mediaUrls[] pairing shared by create() and update(). */
  private assertMediaArraysValid(mediaKeys?: string[], mediaUrls?: string[]): void {
    if (!mediaKeys && !mediaUrls) return;
    if ((mediaKeys?.length ?? 0) !== (mediaUrls?.length ?? 0)) {
      throw new BadRequestException(
        'mediaKeys and mediaUrls must be the same length — each key must have a matching URL at the same index',
      );
    }
  }

  // ─── Categories ────────────────────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async createCategory(name: string, description?: string, imageUrl?: string): Promise<Category> {
    const slug = slugify(name, { lower: true, strict: true });
    const exists = await this.categoryRepo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('Category with this name already exists');
    const category = this.categoryRepo.create({ name, slug, description, imageUrl });
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    Object.assign(category, data);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: string): Promise<boolean> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(category);
    return true;
  }

  // ─── Products ──────────────────────────────────────────────────────────────

  async findAll(
    filter: ProductFilterInput = {},
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<Product>> {
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('product.customisationOptions', 'customisationOptions')
      .where('product.isAvailable = :isAvailable', {
        isAvailable: filter.isAvailable ?? true,
      });

    if (filter.categoryId) qb.andWhere('product.categoryId = :categoryId', { categoryId: filter.categoryId });
    if (filter.isFeatured !== undefined) qb.andWhere('product.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
    if (filter.search) qb.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', { search: `%${filter.search}%` });
    if (filter.minPrice !== undefined) qb.andWhere('product.basePrice >= :minPrice', { minPrice: filter.minPrice });
    if (filter.maxPrice !== undefined) qb.andWhere('product.basePrice <= :maxPrice', { maxPrice: filter.maxPrice });

    qb.orderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.createdAt', 'DESC')
      .skip(pagination.skip)
      .take(pagination.limit);

    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'media', 'variants', 'customisationOptions'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: ['category', 'media', 'variants', 'customisationOptions'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getFeatured(): Promise<Product[]> {
    return this.productRepo.find({
      where: { isFeatured: true, isAvailable: true },
      relations: ['category', 'media'],
      order: { sortOrder: 'ASC' },
      take: 10,
    });
  }

  async create(input: CreateProductInput, adminId: string, adminName: string): Promise<Product> {
    const { mediaKeys, mediaUrls, ...productFields } = input;
    this.assertMediaArraysValid(mediaKeys, mediaUrls);

    const slug = slugify(productFields.name, { lower: true, strict: true });
    const exists = await this.productRepo.findOne({ where: { slug } });
    if (exists) throw new ConflictException('Product with this name already exists');

    // Product + its initial media are created atomically — either both
    // succeed or neither does, so a product can never end up saved with a
    // media insert silently failed halfway through.
    const saved = await this.dataSource.transaction(async (manager) => {
      const product = manager.create(Product, { ...productFields, slug });
      const savedProduct = await manager.save(Product, product);

      if (mediaKeys?.length) {
        const mediaRows = mediaKeys.map((key, index) =>
          manager.create(ProductMedia, {
            productId: savedProduct.id,
            key,
            url: mediaUrls![index],
            type: this.inferMediaType(key),
            isPrimary: index === 0,
            sortOrder: index,
          }),
        );
        await manager.save(ProductMedia, mediaRows);
      }

      return savedProduct;
    });

    await this.staffService.logAction(
      adminId, adminName,
      'CREATE_PRODUCT', 'Product', saved.id,
      null, { name: saved.name, basePrice: saved.basePrice, categoryId: saved.categoryId, mediaCount: mediaKeys?.length ?? 0 },
    );

    return this.findById(saved.id);
  }

  async update(input: UpdateProductInput, adminId: string, adminName: string): Promise<Product> {
    const { mediaKeys, mediaUrls, replaceMedia, ...productFields } = input;
    this.assertMediaArraysValid(mediaKeys, mediaUrls);

    const product = await this.findById(productFields.id);
    const before = { name: product.name, basePrice: product.basePrice, isAvailable: product.isAvailable };

    if (productFields.name && productFields.name !== product.name) {
      const slug = slugify(productFields.name, { lower: true, strict: true });
      const exists = await this.productRepo.findOne({ where: { slug } });
      if (exists) throw new ConflictException('Product with this name already exists');
      product.slug = slug;
    }

    Object.assign(product, productFields);

    const saved = await this.dataSource.transaction(async (manager) => {
      const savedProduct = await manager.save(Product, product);

      if (mediaKeys?.length || replaceMedia) {
        if (replaceMedia) {
          // Wholesale replace: remove everything currently attached before
          // inserting the new set.
          await manager.delete(ProductMedia, { productId: savedProduct.id });
        }

        if (mediaKeys?.length) {
          const existingCount = replaceMedia
            ? 0
            : await manager.count(ProductMedia, { where: { productId: savedProduct.id } });
          const hasExistingPrimary = !replaceMedia && existingCount > 0;

          const mediaRows = mediaKeys.map((key, index) =>
            manager.create(ProductMedia, {
              productId: savedProduct.id,
              key,
              url: mediaUrls![index],
              type: this.inferMediaType(key),
              // Only the very first image of the product overall should be
              // primary — if media already existed and wasn't wiped, none
              // of the newly-added images should steal that flag.
              isPrimary: !hasExistingPrimary && index === 0,
              sortOrder: existingCount + index,
            }),
          );
          await manager.save(ProductMedia, mediaRows);
        }
      }

      return savedProduct;
    });

    await this.staffService.logAction(
      adminId, adminName,
      'UPDATE_PRODUCT', 'Product', saved.id,
      before, {
        name: saved.name, basePrice: saved.basePrice, isAvailable: saved.isAvailable,
        mediaAdded: mediaKeys?.length ?? 0, mediaReplaced: !!replaceMedia,
      },
    );

    return this.findById(saved.id);
  }

  async delete(id: string, adminId: string, adminName: string): Promise<boolean> {
    const product = await this.findById(id);

    await this.staffService.logAction(
      adminId, adminName,
      'DELETE_PRODUCT', 'Product', id,
      { name: product.name, basePrice: product.basePrice }, null,
    );

    await this.productRepo.remove(product);
    return true;
  }

  async toggleAvailability(id: string, adminId: string, adminName: string): Promise<Product> {
    const product = await this.findById(id);
    const before = { isAvailable: product.isAvailable };
    product.isAvailable = !product.isAvailable;
    const saved = await this.productRepo.save(product);

    await this.staffService.logAction(
      adminId, adminName,
      'TOGGLE_PRODUCT_AVAILABILITY', 'Product', id,
      before, { isAvailable: saved.isAvailable },
    );

    return saved;
  }

  async toggleFeatured(id: string, adminId: string, adminName: string): Promise<Product> {
    const product = await this.findById(id);
    const before = { isFeatured: product.isFeatured };
    product.isFeatured = !product.isFeatured;
    const saved = await this.productRepo.save(product);

    await this.staffService.logAction(
      adminId, adminName,
      'TOGGLE_PRODUCT_FEATURED', 'Product', id,
      before, { isFeatured: saved.isFeatured },
    );

    return saved;
  }

  // ─── Variants ──────────────────────────────────────────────────────────────

  async addVariant(productId: string, name: string, type: string, additionalPrice: number): Promise<ProductVariant> {
    await this.findById(productId);
    const variant = this.variantRepo.create({ productId, name, type, additionalPrice });
    return this.variantRepo.save(variant);
  }

  async deleteVariant(variantId: string): Promise<boolean> {
    const variant = await this.variantRepo.findOne({ where: { id: variantId } });
    if (!variant) throw new NotFoundException('Variant not found');
    await this.variantRepo.remove(variant);
    return true;
  }

  // ─── Customisation options ─────────────────────────────────────────────────

  async addCustomisationOption(productId: string, name: string, type: string, additionalPrice: number, isRequired: boolean, options?: string): Promise<CustomisationOption> {
    await this.findById(productId);
    const option = this.optionRepo.create({ productId, name, type, additionalPrice, isRequired, options });
    return this.optionRepo.save(option);
  }

  async deleteCustomisationOption(optionId: string): Promise<boolean> {
    const option = await this.optionRepo.findOne({ where: { id: optionId } });
    if (!option) throw new NotFoundException('Customisation option not found');
    await this.optionRepo.remove(option);
    return true;
  }
}