import { Product } from './product.entity';
export declare class ProductVariant {
    id: string;
    productId: string;
    product: Product;
    name: string;
    type: string;
    additionalPrice: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}
