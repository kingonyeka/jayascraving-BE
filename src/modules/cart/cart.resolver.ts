import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../../common/guards/jwt-auth.guard';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  // ─── Get cart (works for both guest and logged-in) ─────────────────────────

  @Query(() => Cart, { description: 'Get current cart — pass sessionId for guest' })
  @Public()
  async myCart(
    @CurrentUser() user: User,
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ): Promise<Cart> {
    return this.cartService.getOrCreateCart(user?.id, sessionId);
  }

  // ─── Add item ──────────────────────────────────────────────────────────────

  @Mutation(() => Cart, { description: 'Add a product to cart' })
  @Public()
  async addToCart(
    @CurrentUser() user: User,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('quantity', { type: () => Int, defaultValue: 1 }) quantity: number,
    @Args('variantId', { type: () => ID, nullable: true }) variantId?: string,
    @Args('customisations', { nullable: true }) customisations?: string,
    @Args('specialInstructions', { nullable: true }) specialInstructions?: string,
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ): Promise<Cart> {
    return this.cartService.addItem(
      user?.id,
      sessionId,
      productId,
      quantity,
      variantId,
      customisations,
      specialInstructions,
    );
  }

  // ─── Update quantity ───────────────────────────────────────────────────────

  @Mutation(() => Cart, { description: 'Update cart item quantity (0 = remove)' })
  @Public()
  async updateCartItem(
    @CurrentUser() user: User,
    @Args('cartItemId', { type: () => ID }) cartItemId: string,
    @Args('quantity', { type: () => Int }) quantity: number,
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ): Promise<Cart> {
    return this.cartService.updateItemQuantity(cartItemId, quantity, user?.id, sessionId);
  }

  // ─── Remove item ───────────────────────────────────────────────────────────

  @Mutation(() => Cart, { description: 'Remove an item from cart' })
  @Public()
  async removeFromCart(
    @CurrentUser() user: User,
    @Args('cartItemId', { type: () => ID }) cartItemId: string,
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ): Promise<Cart> {
    return this.cartService.removeItem(cartItemId, user?.id, sessionId);
  }

  // ─── Clear cart ────────────────────────────────────────────────────────────

  @Mutation(() => Boolean, { description: 'Clear all items from cart' })
  @Public()
  async clearCart(
    @CurrentUser() user: User,
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ): Promise<boolean> {
    return this.cartService.clearCart(user?.id, sessionId);
  }

  // ─── Merge guest cart on login ─────────────────────────────────────────────

  @Mutation(() => Cart, { description: 'Merge guest cart into user cart after login' })
  @UseGuards(JwtAuthGuard)
  async mergeCart(
    @CurrentUser() user: User,
    @Args('sessionId') sessionId: string,
  ): Promise<Cart> {
    return this.cartService.mergeGuestCart(sessionId, user.id);
  }
}