import { Product } from './product.entity';
export declare class CustomisationOption {
    id: string;
    productId: string;
    product: Product;
    name: string;
    type: string;
    options?: string;
    additionalPrice: number;
    isRequired: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
