import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CustomisationOption } from './entities/customisation-option.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { ProductFilterInput } from './dto/product-filter.input';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
declare const PaginatedProducts_base: abstract new () => {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedProducts extends PaginatedProducts_base {
}
export declare class ProductsResolver {
    private readonly productsService;
    constructor(productsService: ProductsService);
    products(filter?: ProductFilterInput, pagination?: PaginationInput): Promise<PaginatedProducts>;
    product(id: string): Promise<Product>;
    productBySlug(slug: string): Promise<Product>;
    featuredProducts(): Promise<Product[]>;
    categories(): Promise<Category[]>;
    createProduct(user: User, input: CreateProductInput): Promise<Product>;
    updateProduct(user: User, input: UpdateProductInput): Promise<Product>;
    deleteProduct(user: User, id: string): Promise<boolean>;
    toggleProductAvailability(user: User, id: string): Promise<Product>;
    toggleProductFeatured(user: User, id: string): Promise<Product>;
    createCategory(name: string, description?: string, imageUrl?: string): Promise<Category>;
    deleteCategory(id: string): Promise<boolean>;
    addProductVariant(productId: string, name: string, type: string, additionalPrice: number): Promise<ProductVariant>;
    deleteProductVariant(variantId: string): Promise<boolean>;
    addCustomisationOption(productId: string, name: string, type: string, additionalPrice: number, isRequired: boolean, options?: string): Promise<CustomisationOption>;
    deleteCustomisationOption(optionId: string): Promise<boolean>;
}
export {};
