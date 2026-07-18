import { Resolver, Query, Mutation, Args, ID, Int, ObjectType, Field, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review, ReviewStatus } from './entities/review.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { PaginatedResult } from '../../common/types/paginated-result.type';
import { Public } from '../../common/guards/jwt-auth.guard';

@ObjectType()
class PaginatedReviews extends PaginatedResult(Review) {}

@ObjectType()
class RatingBreakdown {
  @Field(() => Int) star: number;
  @Field(() => Int) count: number;
}

@ObjectType()
class ProductRatingSummary {
  @Field(() => Float) average: number;
  @Field(() => Int) total: number;
  @Field(() => [RatingBreakdown]) breakdown: RatingBreakdown[];
}

@Resolver(() => Review)
export class ReviewsResolver {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Query(() => PaginatedReviews, { description: 'Get approved reviews for a product' })
  @Public()
  productReviews(
    @Args('productId', { type: () => ID }) productId: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedReviews> {
    return this.reviewsService.getProductReviews(productId, pagination) as any;
  }

  @Query(() => ProductRatingSummary, { description: 'Get rating summary for a product' })
  @Public()
  async productRatingSummary(@Args('productId', { type: () => ID }) productId: string): Promise<ProductRatingSummary> {
    const result = await this.reviewsService.getProductRatingSummary(productId);
    const breakdown = Object.entries(result.breakdown).map(([star, count]) => ({ star: Number(star), count }));
    return { average: result.average, total: result.total, breakdown };
  }

  @Query(() => [Review], { description: 'Get current user reviews' })
  @UseGuards(JwtAuthGuard)
  myReviews(@CurrentUser() user: User): Promise<Review[]> {
    return this.reviewsService.getMyReviews(user.id);
  }

  @Query(() => PaginatedReviews, { description: 'Admin: get all reviews' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  allReviews(
    @Args('status', { type: () => ReviewStatus, nullable: true }) status?: ReviewStatus,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedReviews> {
    return this.reviewsService.getAllReviews(status, pagination) as any;
  }

  @Mutation(() => Review, { description: 'Submit a product review' })
  @UseGuards(JwtAuthGuard)
  createReview(
    @CurrentUser() user: User,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('rating', { type: () => Int }) rating: number,
    @Args('comment', { nullable: true }) comment?: string,
    @Args('mediaUrls', { type: () => [String], nullable: true }) mediaUrls?: string[],
    @Args('mediaKeys', { type: () => [String], nullable: true }) mediaKeys?: string[],
  ): Promise<Review> {
    return this.reviewsService.createReview(user.id, productId, orderId, rating, comment, mediaUrls ?? [], mediaKeys ?? []);
  }

  @Mutation(() => Review, { description: 'Update your own review' })
  @UseGuards(JwtAuthGuard)
  updateReview(
    @CurrentUser() user: User,
    @Args('reviewId', { type: () => ID }) reviewId: string,
    @Args('rating', { type: () => Int, nullable: true }) rating?: number,
    @Args('comment', { nullable: true }) comment?: string,
  ): Promise<Review> {
    return this.reviewsService.updateReview(reviewId, user.id, rating, comment);
  }

  @Mutation(() => Boolean, { description: 'Delete your own review' })
  @UseGuards(JwtAuthGuard)
  deleteReview(@CurrentUser() user: User, @Args('reviewId', { type: () => ID }) reviewId: string): Promise<boolean> {
    return this.reviewsService.deleteReview(reviewId, user.id);
  }

  @Mutation(() => Review, { description: 'Admin: approve a review' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  approveReview(@CurrentUser() user: User, @Args('reviewId', { type: () => ID }) reviewId: string): Promise<Review> {
    return this.reviewsService.approveReview(reviewId, user.id, user.fullName);
  }

  @Mutation(() => Review, { description: 'Admin: reject a review' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  rejectReview(@CurrentUser() user: User, @Args('reviewId', { type: () => ID }) reviewId: string): Promise<Review> {
    return this.reviewsService.rejectReview(reviewId, user.id, user.fullName);
  }

  @Mutation(() => Review, { description: 'Admin: flag a review' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  flagReview(
    @CurrentUser() user: User,
    @Args('reviewId', { type: () => ID }) reviewId: string,
    @Args('reason') reason: string,
  ): Promise<Review> {
    return this.reviewsService.flagReview(reviewId, reason, user.id, user.fullName);
  }

  @Mutation(() => Review, { description: 'Admin: respond to a review' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  respondToReview(
    @CurrentUser() user: User,
    @Args('reviewId', { type: () => ID }) reviewId: string,
    @Args('response') response: string,
  ): Promise<Review> {
    return this.reviewsService.respondToReview(reviewId, user.id, user.fullName, response);
  }
}