import { Category } from './category.entity';
import { ProductVariant } from './product-variant.entity';
import { ProductMedia } from './product-media.entity';
import { CustomisationOption } from './customisation-option.entity';
export declare class Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    categoryId: string;
    category: Category;
    variants: ProductVariant[];
    media: ProductMedia[];
    customisationOptions: CustomisationOption[];
    isAvailable: boolean;
    isFeatured: boolean;
    stockCount: number;
    metaTitle?: string;
    metaDescription?: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
