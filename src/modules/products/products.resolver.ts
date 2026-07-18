import { Resolver, Query, Mutation, Args, ID, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CustomisationOption } from './entities/customisation-option.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductFilterInput } from './dto/product-filter.input';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { PaginatedResult } from '../../common/types/paginated-result.type';
import { Public } from '../../common/guards/jwt-auth.guard';

@ObjectType()
class PaginatedProducts extends PaginatedResult(Product) {}

@Resolver(() => Product)
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Public queries ────────────────────────────────────────────────────────

  @Query(() => PaginatedProducts, { description: 'Get all available products with filters' })
  @Public()
  products(
    @Args('filter', { nullable: true }) filter?: ProductFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedProducts> {
    return this.productsService.findAll(filter, pagination) as any;
  }

  @Query(() => Product, { description: 'Get a product by ID' })
  @Public()
  product(@Args('id', { type: () => ID }) id: string): Promise<Product> {
    return this.productsService.findById(id);
  }

  @Query(() => Product, { description: 'Get a product by slug' })
  @Public()
  productBySlug(@Args('slug') slug: string): Promise<Product> {
    return this.productsService.findBySlug(slug);
  }

  @Query(() => [Product], { description: 'Get featured products' })
  @Public()
  featuredProducts(): Promise<Product[]> {
    return this.productsService.getFeatured();
  }

  @Query(() => [Category], { description: 'Get all active categories' })
  @Public()
  categories(): Promise<Category[]> {
    return this.productsService.getCategories();
  }

  // ─── Admin mutations — products ────────────────────────────────────────────

  @Mutation(() => Product, { description: 'Admin: create a product' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  createProduct(
    @CurrentUser() user: User,
    @Args('input') input: CreateProductInput,
  ): Promise<Product> {
    return this.productsService.create(input, user.id, user.fullName);
  }

  @Mutation(() => Product, { description: 'Admin: update a product' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  updateProduct(
    @CurrentUser() user: User,
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    return this.productsService.update(input, user.id, user.fullName);
  }

  @Mutation(() => Boolean, { description: 'Admin: delete a product' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteProduct(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.productsService.delete(id, user.id, user.fullName);
  }

  @Mutation(() => Product, { description: 'Admin: toggle product availability' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  toggleProductAvailability(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product> {
    return this.productsService.toggleAvailability(id, user.id, user.fullName);
  }

  @Mutation(() => Product, { description: 'Admin: toggle featured status' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  toggleProductFeatured(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Product> {
    return this.productsService.toggleFeatured(id, user.id, user.fullName);
  }

  // ─── Admin mutations — categories ──────────────────────────────────────────

  @Mutation(() => Category, { description: 'Admin: create a category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createCategory(
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string,
    @Args('imageUrl', { nullable: true }) imageUrl?: string,
  ): Promise<Category> {
    return this.productsService.createCategory(name, description, imageUrl);
  }

  @Mutation(() => Boolean, { description: 'Admin: delete a category' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteCategory(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.productsService.deleteCategory(id);
  }

  // ─── Admin mutations — variants ────────────────────────────────────────────

  @Mutation(() => ProductVariant, { description: 'Admin: add a product variant' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  addProductVariant(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('name') name: string,
    @Args('type') type: string,
    @Args('additionalPrice', { type: () => Number, defaultValue: 0 }) additionalPrice: number,
  ): Promise<ProductVariant> {
    return this.productsService.addVariant(productId, name, type, additionalPrice);
  }

  @Mutation(() => Boolean, { description: 'Admin: delete a product variant' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  deleteProductVariant(@Args('variantId', { type: () => ID }) variantId: string): Promise<boolean> {
    return this.productsService.deleteVariant(variantId);
  }

  // ─── Admin mutations — customisation options ───────────────────────────────

  @Mutation(() => CustomisationOption, { description: 'Admin: add a customisation option to a product' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  addCustomisationOption(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('name') name: string,
    @Args('type') type: string,
    @Args('additionalPrice', { type: () => Number, defaultValue: 0 }) additionalPrice: number,
    @Args('isRequired', { defaultValue: false }) isRequired: boolean,
    @Args('options', { nullable: true }) options?: string,
  ): Promise<CustomisationOption> {
    return this.productsService.addCustomisationOption(productId, name, type, additionalPrice, isRequired, options);
  }

  @Mutation(() => Boolean, { description: 'Admin: delete a customisation option' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteCustomisationOption(@Args('optionId', { type: () => ID }) optionId: string): Promise<boolean> {
    return this.productsService.deleteCustomisationOption(optionId);
  }
}