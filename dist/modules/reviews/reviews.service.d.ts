import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { StaffService } from '../staff/staff.service';
import { PaginationInput } from '../../common/types/pagination.type';
import { IPaginatedResult } from '../../common/types/paginated-result.type';
export declare class ReviewsService {
    private readonly reviewRepo;
    private readonly staffService;
    constructor(reviewRepo: Repository<Review>, staffService: StaffService);
    createReview(userId: string, productId: string, orderId: string, rating: number, comment?: string, mediaUrls?: string[], mediaKeys?: string[]): Promise<Review>;
    updateReview(reviewId: string, userId: string, rating?: number, comment?: string): Promise<Review>;
    deleteReview(reviewId: string, userId: string): Promise<boolean>;
    getProductReviews(productId: string, pagination?: PaginationInput): Promise<IPaginatedResult<Review>>;
    getProductRatingSummary(productId: string): Promise<{
        average: number;
        total: number;
        breakdown: Record<number, number>;
    }>;
    getMyReviews(userId: string): Promise<Review[]>;
    getAllReviews(status?: ReviewStatus, pagination?: PaginationInput): Promise<IPaginatedResult<Review>>;
    approveReview(reviewId: string, adminId: string, adminName: string): Promise<Review>;
    rejectReview(reviewId: string, adminId: string, adminName: string): Promise<Review>;
    flagReview(reviewId: string, reason: string, adminId: string, adminName: string): Promise<Review>;
    respondToReview(reviewId: string, adminUserId: string, adminName: string, response: string): Promise<Review>;
    findById(id: string): Promise<Review>;
}
