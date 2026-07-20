import { Product } from './product.entity';
export declare enum MediaType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO"
}
export declare class ProductMedia {
    id: string;
    productId: string;
    product: Product;
    url: string;
    key: string;
    type: MediaType;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: Date;
}
