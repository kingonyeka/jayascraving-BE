import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';
import { AbandonedCartService } from '../abandoned-cart/abandoned-cart.service';
export declare class CartService {
    private readonly cartRepo;
    private readonly cartItemRepo;
    private readonly productRepo;
    private readonly productsService;
    private readonly dataSource;
    private readonly abandonedCartService;
    constructor(cartRepo: Repository<Cart>, cartItemRepo: Repository<CartItem>, productRepo: Repository<Product>, productsService: ProductsService, dataSource: DataSource, abandonedCartService: AbandonedCartService);
    getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart>;
    getCartById(cartId: string): Promise<Cart>;
    addItem(userId: string | undefined, sessionId: string | undefined, productId: string, quantity: number, variantId?: string, customisations?: string, specialInstructions?: string): Promise<Cart>;
    updateItemQuantity(cartItemId: string, quantity: number, userId?: string, sessionId?: string): Promise<Cart>;
    removeItem(cartItemId: string, userId?: string, sessionId?: string): Promise<Cart>;
    clearCart(userId?: string, sessionId?: string): Promise<boolean>;
    mergeGuestCart(sessionId: string, userId: string): Promise<Cart>;
}
