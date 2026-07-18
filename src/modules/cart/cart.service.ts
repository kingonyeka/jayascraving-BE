
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/entities/product.entity';
import { AbandonedCartService } from '../abandoned-cart/abandoned-cart.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
    private readonly abandonedCartService: AbandonedCartService,
  ) {}

  // ─── Get or create cart ────────────────────────────────────────────────────

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (!userId && !sessionId) {
      throw new BadRequestException('userId or sessionId is required');
    }

    const where = userId ? { userId } : { sessionId };
    let cart = await this.cartRepo.findOne({ where, relations: ['items'] });

    if (!cart) {
      cart = this.cartRepo.create(userId ? { userId } : { sessionId });
      cart = await this.cartRepo.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async getCartById(cartId: string): Promise<Cart> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ['items'],
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  // ─── Add item with inventory reservation ──────────────────────────────────

  async addItem(
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
    quantity: number,
    variantId?: string,
    customisations?: string,
    specialInstructions?: string,
  ): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // ─── Inventory reservation using a transaction ─────────────────────────
    // We use a DB transaction to:
    // 1. Check stock atomically (no race condition between check and decrement)
    // 2. Decrement stock immediately on add to cart
    // 3. Roll back everything if anything fails

    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: productId },
        lock: { mode: 'pessimistic_write' }, // row-level lock prevents concurrent oversell
      });

      if (!product) throw new NotFoundException('Product not found');
      if (!product.isAvailable) {
        throw new BadRequestException('This product is currently unavailable');
      }

      // check stock if tracking is enabled (stockCount > 0 means we track it)
      if (product.stockCount > 0 && product.stockCount < quantity) {
        throw new BadRequestException(
          `Only ${product.stockCount} unit(s) available for ${product.name}`,
        );
      }

      // find variant
      let variantName: string | undefined;
      let additionalPrice = 0;
      if (variantId) {
        const variant = product.variants?.find((v) => v.id === variantId);
        if (!variant) throw new BadRequestException('Variant not found on this product');
        variantName = `${variant.type}: ${variant.name}`;
        additionalPrice = Number(variant.additionalPrice);
      }

      const unitPrice = Number(product.basePrice) + additionalPrice;

      // check if same product + variant already in cart
      // Previously `variantId: variantId ?? undefined` — TypeORM drops
      // properties whose value is `undefined` from the WHERE clause
      // entirely (rather than translating to "IS NULL"), so when adding the
      // base product with no variant, this lookup had no variant condition
      // at all and could match — and silently bump the quantity of — an
      // existing cart line for a *different* variant of the same product.
      const existing = await manager.findOne(CartItem, {
        where: { cartId: cart.id, productId, variantId: variantId ?? IsNull() },
      });

      if (existing) {
        // validate total quantity doesn't exceed stock
        const newQty = existing.quantity + quantity;
        if (product.stockCount > 0 && product.stockCount < newQty) {
          throw new BadRequestException(
            `Cannot add ${quantity} more — only ${product.stockCount - existing.quantity} additional unit(s) available`,
          );
        }
        existing.quantity = newQty;
        await manager.save(CartItem, existing);
      } else {
        const item = manager.create(CartItem, {
          cartId: cart.id,
          productId,
          productName: product.name,
          unitPrice,
          quantity,
          variantId,
          variantName,
          customisations,
          specialInstructions,
        });
        await manager.save(CartItem, item);
      }

      // decrement reserved stock
      if (product.stockCount > 0) {
        await manager.decrement(
          Product,
          { id: productId },
          'stockCount',
          quantity,
        );
      }

      return this.getCartById(cart.id);
    }).then(async (updatedCart) => {
      // Schedule (or reschedule) an abandoned-cart recovery email for
      // logged-in users. Previously this was never wired up anywhere —
      // AbandonedCartService.scheduleRecovery() existed with a comment
      // saying "call this from CartService.addItem()" but nothing did.
      if (userId) {
        await this.abandonedCartService.scheduleRecovery(updatedCart.id, userId);
      }
      return updatedCart;
    });
  }

  // ─── Update item quantity ──────────────────────────────────────────────────

  async updateItemQuantity(
    cartItemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(CartItem, {
        where: { id: cartItemId },
        relations: ['cart'],
      });
      if (!item) throw new NotFoundException('Cart item not found');

      const cart = item.cart;
      if (userId && cart.userId !== userId) throw new NotFoundException('Cart item not found');
      if (sessionId && cart.sessionId !== sessionId) throw new NotFoundException('Cart item not found');

      const product = await manager.findOne(Product, {
        where: { id: item.productId },
        lock: { mode: 'pessimistic_write' },
      });

      const diff = quantity - item.quantity; // positive = adding more, negative = reducing

      if (quantity <= 0) {
        // release stock when item removed
        if (product && product.stockCount >= 0) {
          await manager.increment(Product, { id: item.productId }, 'stockCount', item.quantity);
        }
        await manager.remove(CartItem, item);
      } else {
        // validate new quantity against stock
        if (product && product.stockCount > 0 && diff > 0 && product.stockCount < diff) {
          throw new BadRequestException(
            `Only ${product.stockCount} additional unit(s) available`,
          );
        }

        // adjust reserved stock
        if (product && product.stockCount >= 0 && diff !== 0) {
          if (diff > 0) {
            await manager.decrement(Product, { id: item.productId }, 'stockCount', diff);
          } else {
            await manager.increment(Product, { id: item.productId }, 'stockCount', Math.abs(diff));
          }
        }

        item.quantity = quantity;
        await manager.save(CartItem, item);
      }

      return this.getCartById(cart.id);
    });
  }

  // ─── Remove item — release stock ──────────────────────────────────────────

  async removeItem(
    cartItemId: string,
    userId?: string,
    sessionId?: string,
  ): Promise<Cart> {
    return this.dataSource.transaction(async (manager) => {
      const item = await manager.findOne(CartItem, {
        where: { id: cartItemId },
        relations: ['cart'],
      });
      if (!item) throw new NotFoundException('Cart item not found');

      const cart = item.cart;
      if (userId && cart.userId !== userId) throw new NotFoundException('Cart item not found');
      if (sessionId && cart.sessionId !== sessionId) throw new NotFoundException('Cart item not found');

      // release reserved stock back to product
      await manager.increment(
        Product,
        { id: item.productId },
        'stockCount',
        item.quantity,
      );

      await manager.remove(CartItem, item);
      return this.getCartById(cart.id);
    });
  }

  // ─── Clear cart — release all reserved stock ───────────────────────────────

  async clearCart(userId?: string, sessionId?: string): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const where = userId ? { userId } : { sessionId };
      const cart = await this.cartRepo.findOne({ where, relations: ['items'] });
      if (!cart || !cart.items?.length) return true;

      // release all reserved stock
      for (const item of cart.items) {
        await manager.increment(
          Product,
          { id: item.productId },
          'stockCount',
          item.quantity,
        );
      }

      await manager.remove(CartItem, cart.items);
      return true;
    });
  }

  // ─── Merge guest cart on login ─────────────────────────────────────────────

  async mergeGuestCart(sessionId: string, userId: string): Promise<Cart> {
    const guestCart = await this.cartRepo.findOne({
      where: { sessionId },
      relations: ['items'],
    });

    if (!guestCart || !guestCart.items?.length) {
      return this.getOrCreateCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const guestItem of guestCart.items) {
      const existing = userCart.items?.find(
        (i) => i.productId === guestItem.productId && i.variantId === guestItem.variantId,
      );

      if (existing) {
        existing.quantity += guestItem.quantity;
        await this.cartItemRepo.save(existing);
      } else {
        const newItem = this.cartItemRepo.create({
          ...guestItem,
          id: undefined,
          cartId: userCart.id,
        });
        await this.cartItemRepo.save(newItem);
      }
    }

    // delete guest cart — stock already reserved, no need to adjust
    await this.cartRepo.remove(guestCart);
    return this.getCartById(userCart.id);
  }
}