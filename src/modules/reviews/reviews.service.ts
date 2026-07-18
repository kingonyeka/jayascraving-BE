import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './entities/review.entity';
import { StaffService } from '../staff/staff.service';
import { PaginationInput } from '../../common/types/pagination.type';
import { buildPaginatedResult, IPaginatedResult } from '../../common/types/paginated-result.type';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    private readonly staffService: StaffService,
  ) {}

  async createReview(
    userId: string,
    productId: string,
    orderId: string,
    rating: number,
    comment?: string,
    mediaUrls: string[] = [],
    mediaKeys: string[] = [],
  ): Promise<Review> {
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');

    const existing = await this.reviewRepo.findOne({ where: { userId, productId, orderId } });
    if (existing) throw new BadRequestException('You have already reviewed this product for this order');

    const review = this.reviewRepo.create({
      userId, productId, orderId, rating, comment,
      mediaUrls, mediaKeys,
      isVerifiedPurchase: true,
      status: ReviewStatus.PENDING,
    });

    return this.reviewRepo.save(review);
  }

  async updateReview(reviewId: string, userId: string, rating?: number, comment?: string): Promise<Review> {
    const review = await this.findById(reviewId);
    if (review.userId !== userId) throw new ForbiddenException('You can only edit your own reviews');
    if (review.status === ReviewStatus.APPROVED) throw new BadRequestException('Approved reviews cannot be edited');
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;
    review.status = ReviewStatus.PENDING;
    return this.reviewRepo.save(review);
  }

  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const review = await this.findById(reviewId);
    if (review.userId !== userId) throw new ForbiddenException('You can only delete your own reviews');
    await this.reviewRepo.remove(review);
    return true;
  }

  async getProductReviews(
    productId: string,
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<Review>> {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { productId, status: ReviewStatus.APPROVED },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async getProductRatingSummary(productId: string) {
    const reviews = await this.reviewRepo.find({
      where: { productId, status: ReviewStatus.APPROVED },
      select: ['rating'],
    });
    const total = reviews.length;
    if (total === 0) return { average: 0, total: 0, breakdown: {} };
    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of reviews) {
      breakdown[r.rating] = (breakdown[r.rating] ?? 0) + 1;
      sum += r.rating;
    }
    return { average: Math.round((sum / total) * 10) / 10, total, breakdown };
  }

  async getMyReviews(userId: string): Promise<Review[]> {
    return this.reviewRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getAllReviews(
    status?: ReviewStatus,
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<Review>> {
    const where = status ? { status } : {};
    const [data, total] = await this.reviewRepo.findAndCount({
      where, order: { createdAt: 'DESC' },
      skip: pagination.skip, take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async approveReview(reviewId: string, adminId: string, adminName: string): Promise<Review> {
    const review = await this.findById(reviewId);
    const before = { status: review.status };
    review.status = ReviewStatus.APPROVED;
    const saved = await this.reviewRepo.save(review);
    await this.staffService.logAction(adminId, adminName, 'APPROVE_REVIEW', 'Review', reviewId, before, { status: ReviewStatus.APPROVED });
    return saved;
  }

  async rejectReview(reviewId: string, adminId: string, adminName: string): Promise<Review> {
    const review = await this.findById(reviewId);
    const before = { status: review.status };
    review.status = ReviewStatus.REJECTED;
    const saved = await this.reviewRepo.save(review);
    await this.staffService.logAction(adminId, adminName, 'REJECT_REVIEW', 'Review', reviewId, before, { status: ReviewStatus.REJECTED });
    return saved;
  }

  async flagReview(reviewId: string, reason: string, adminId: string, adminName: string): Promise<Review> {
    const review = await this.findById(reviewId);
    const before = { status: review.status };
    review.status = ReviewStatus.FLAGGED;
    review.flagReason = reason;
    const saved = await this.reviewRepo.save(review);
    await this.staffService.logAction(adminId, adminName, 'FLAG_REVIEW', 'Review', reviewId, before, { status: ReviewStatus.FLAGGED, reason });
    return saved;
  }

  async respondToReview(reviewId: string, adminUserId: string, adminName: string, response: string): Promise<Review> {
    const review = await this.findById(reviewId);
    review.adminResponse = response;
    review.respondedBy = adminUserId;
    review.respondedAt = new Date();
    const saved = await this.reviewRepo.save(review);
    await this.staffService.logAction(adminUserId, adminName, 'RESPOND_TO_REVIEW', 'Review', reviewId, null, { response });
    return saved;
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
}