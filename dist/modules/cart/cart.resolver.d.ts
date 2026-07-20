import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { User } from '../users/entities/user.entity';
export declare class CartResolver {
    private readonly cartService;
    constructor(cartService: CartService);
    myCart(user: User, sessionId?: string): Promise<Cart>;
    addToCart(user: User, productId: string, quantity: number, variantId?: string, customisations?: string, specialInstructions?: string, sessionId?: string): Promise<Cart>;
    updateCartItem(user: User, cartItemId: string, quantity: number, sessionId?: string): Promise<Cart>;
    removeFromCart(user: User, cartItemId: string, sessionId?: string): Promise<Cart>;
    clearCart(user: User, sessionId?: string): Promise<boolean>;
    mergeCart(user: User, sessionId: string): Promise<Cart>;
}
