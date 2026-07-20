import { CartItem } from './cart-item.entity';
export declare class Cart {
    id: string;
    userId?: string;
    sessionId?: string;
    items: CartItem[];
    get subtotal(): number;
    createdAt: Date;
    updatedAt: Date;
}
