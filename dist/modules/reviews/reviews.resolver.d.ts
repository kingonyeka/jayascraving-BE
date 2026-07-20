import { ReviewsService } from './reviews.service';
import { Review, ReviewStatus } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
declare const PaginatedReviews_base: abstract new () => {
    data: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedReviews extends PaginatedReviews_base {
}
declare class RatingBreakdown {
    star: number;
    count: number;
}
declare class ProductRatingSummary {
    average: number;
    total: number;
    breakdown: RatingBreakdown[];
}
export declare class ReviewsResolver {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    productReviews(productId: string, pagination?: PaginationInput): Promise<PaginatedReviews>;
    productRatingSummary(productId: string): Promise<ProductRatingSummary>;
    myReviews(user: User): Promise<Review[]>;
    allReviews(status?: ReviewStatus, pagination?: PaginationInput): Promise<PaginatedReviews>;
    createReview(user: User, productId: string, orderId: string, rating: number, comment?: string, mediaUrls?: string[], mediaKeys?: string[]): Promise<Review>;
    updateReview(user: User, reviewId: string, rating?: number, comment?: string): Promise<Review>;
    deleteReview(user: User, reviewId: string): Promise<boolean>;
    approveReview(user: User, reviewId: string): Promise<Review>;
    rejectReview(user: User, reviewId: string): Promise<Review>;
    flagReview(user: User, reviewId: string, reason: string): Promise<Review>;
    respondToReview(user: User, reviewId: string, response: string): Promise<Review>;
}
export {};
