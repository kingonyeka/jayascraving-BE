import { Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';
import { ProductMedia } from '../products/entities/product-media.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
export declare class ProductLoader {
    private readonly productRepo;
    private readonly categoryRepo;
    private readonly mediaRepo;
    private readonly variantRepo;
    constructor(productRepo: Repository<Product>, categoryRepo: Repository<Category>, mediaRepo: Repository<ProductMedia>, variantRepo: Repository<ProductVariant>);
    readonly byId: DataLoader<string, Product, string>;
    readonly categoryById: DataLoader<string, Category, string>;
    readonly mediaByProductId: DataLoader<string, ProductMedia[], string>;
    readonly variantsByProductId: DataLoader<string, ProductVariant[], string>;
}
