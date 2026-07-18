import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromoCode, DiscountType } from './entities/promo-code.entity';
import { PromoUsage } from './entities/promo-usage.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class PromoValidationResult {
  @Field(() => PromoCode)
  promoCode: PromoCode;

  @Field(() => Float)
  discountAmount: number;

  @Field(() => Float)
  finalTotal: number;
}

@ObjectType()
class BroadcastPromotionResult {
  @Field(() => PromoCode)
  promoCode: PromoCode;

  @Field(() => Int)
  notifiedCount: number;
}

@Resolver()
export class PromotionsResolver {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ─── Customer: validate promo code at checkout ─────────────────────────────

  @Query(() => PromoValidationResult, { description: 'Validate and preview a promo code discount' })
  @UseGuards(JwtAuthGuard)
  async validatePromoCode(
    @CurrentUser() user: User,
    @Args('code') code: string,
    @Args('orderSubtotal', { type: () => Float }) orderSubtotal: number,
    @Args('deliveryFee', { type: () => Float, defaultValue: 0 }) deliveryFee: number,
  ): Promise<PromoValidationResult> {
    return this.promotionsService.applyPromoCode(
      code,
      user.id,
      orderSubtotal,
      deliveryFee,
    );
  }

  // ─── Admin queries ─────────────────────────────────────────────────────────

  @Query(() => [PromoCode], { description: 'Admin: get all promo codes' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  promoCodes(): Promise<PromoCode[]> {
    return this.promotionsService.findAll();
  }

  @Query(() => PromoCode, { description: 'Admin: get a promo code by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  promoCode(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PromoCode> {
    return this.promotionsService.findById(id);
  }

  @Query(() => [PromoUsage], { description: 'Admin: get usage history for a promo code' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  promoUsageHistory(
    @Args('promoCodeId', { type: () => ID }) promoCodeId: string,
  ): Promise<PromoUsage[]> {
    return this.promotionsService.getUsageHistory(promoCodeId);
  }

  // ─── Admin mutations ───────────────────────────────────────────────────────

  @Mutation(() => PromoCode, { description: 'Admin: create a promo code' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createPromoCode(
    @CurrentUser() user: User,
    @Args('code') code: string,
    @Args('discountType', { type: () => DiscountType }) discountType: DiscountType,
    @Args('discountValue', { type: () => Float }) discountValue: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('minimumOrderValue', { type: () => Float, nullable: true }) minimumOrderValue?: number,
    @Args('maximumDiscount', { type: () => Float, nullable: true }) maximumDiscount?: number,
    @Args('usageLimit', { type: () => Int, nullable: true }) usageLimit?: number,
    @Args('perUserLimit', { type: () => Int, nullable: true }) perUserLimit?: number,
    @Args('startsAt', { nullable: true }) startsAt?: string,
    @Args('expiresAt', { nullable: true }) expiresAt?: string,
  ): Promise<PromoCode> {
    return this.promotionsService.create(
      {
        code,
        discountType,
        discountValue,
        description,
        minimumOrderValue,
        maximumDiscount,
        usageLimit,
        perUserLimit,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      user.id,
    );
  }

  @Mutation(() => PromoCode, { description: 'Admin: toggle promo code active status' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  togglePromoCode(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PromoCode> {
    return this.promotionsService.toggleActive(id);
  }

  @Mutation(() => Boolean, { description: 'Admin: delete a promo code' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deletePromoCode(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.promotionsService.delete(id);
  }

  @Mutation(() => BroadcastPromotionResult, {
    description: 'Admin: announce an active promo code to all customers (in-app + push)',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  broadcastPromoCode(
    @Args('promoCodeId', { type: () => ID }) promoCodeId: string,
    @Args('title') title: string,
    @Args('body') body: string,
  ): Promise<BroadcastPromotionResult> {
    return this.promotionsService.broadcastPromotion(promoCodeId, title, body);
  }
}