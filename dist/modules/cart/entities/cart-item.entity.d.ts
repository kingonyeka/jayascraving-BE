import { Cart } from './cart.entity';
export declare class CartItem {
    id: string;
    cartId: string;
    cart: Cart;
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
    variantId?: string;
    variantName?: string;
    customisations?: string;
    specialInstructions?: string;
    get totalPrice(): number;
    createdAt: Date;
    updatedAt: Date;
}
