"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const staff_service_1 = require("../staff/staff.service");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
let ReviewsService = class ReviewsService {
    constructor(reviewRepo, staffService) {
        this.reviewRepo = reviewRepo;
        this.staffService = staffService;
    }
    async createReview(userId, productId, orderId, rating, comment, mediaUrls = [], mediaKeys = []) {
        if (rating < 1 || rating > 5)
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        const existing = await this.reviewRepo.findOne({ where: { userId, productId, orderId } });
        if (existing)
            throw new common_1.BadRequestException('You have already reviewed this product for this order');
        const review = this.reviewRepo.create({
            userId, productId, orderId, rating, comment,
            mediaUrls, mediaKeys,
            isVerifiedPurchase: true,
            status: review_entity_1.ReviewStatus.PENDING,
        });
        return this.reviewRepo.save(review);
    }
    async updateReview(reviewId, userId, rating, comment) {
        const review = await this.findById(reviewId);
        if (review.userId !== userId)
            throw new common_1.ForbiddenException('You can only edit your own reviews');
        if (review.status === review_entity_1.ReviewStatus.APPROVED)
            throw new common_1.BadRequestException('Approved reviews cannot be edited');
        if (rating !== undefined) {
            if (rating < 1 || rating > 5)
                throw new common_1.BadRequestException('Rating must be between 1 and 5');
            review.rating = rating;
        }
        if (comment !== undefined)
            review.comment = comment;
        review.status = review_entity_1.ReviewStatus.PENDING;
        return this.reviewRepo.save(review);
    }
    async deleteReview(reviewId, userId) {
        const review = await this.findById(reviewId);
        if (review.userId !== userId)
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        await this.reviewRepo.remove(review);
        return true;
    }
    async getProductReviews(productId, pagination = new pagination_type_1.PaginationInput()) {
        const [data, total] = await this.reviewRepo.findAndCount({
            where: { productId, status: review_entity_1.ReviewStatus.APPROVED },
            order: { createdAt: 'DESC' },
            skip: pagination.skip,
            take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async getProductRatingSummary(productId) {
        const reviews = await this.reviewRepo.find({
            where: { productId, status: review_entity_1.ReviewStatus.APPROVED },
            select: ['rating'],
        });
        const total = reviews.length;
        if (total === 0)
            return { average: 0, total: 0, breakdown: {} };
        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0;
        for (const r of reviews) {
            breakdown[r.rating] = (breakdown[r.rating] ?? 0) + 1;
            sum += r.rating;
        }
        return { average: Math.round((sum / total) * 10) / 10, total, breakdown };
    }
    async getMyReviews(userId) {
        return this.reviewRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }
    async getAllReviews(status, pagination = new pagination_type_1.PaginationInput()) {
        const where = status ? { status } : {};
        const [data, total] = await this.reviewRepo.findAndCount({
            where, order: { createdAt: 'DESC' },
            skip: pagination.skip, take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async approveReview(reviewId, adminId, adminName) {
        const review = await this.findById(reviewId);
        const before = { status: review.status };
        review.status = review_entity_1.ReviewStatus.APPROVED;
        const saved = await this.reviewRepo.save(review);
        await this.staffService.logAction(adminId, adminName, 'APPROVE_REVIEW', 'Review', reviewId, before, { status: review_entity_1.ReviewStatus.APPROVED });
        return saved;
    }
    async rejectReview(reviewId, adminId, adminName) {
        const review = await this.findById(reviewId);
        const before = { status: review.status };
        review.status = review_entity_1.ReviewStatus.REJECTED;
        const saved = await this.reviewRepo.save(review);
        await this.staffService.logAction(adminId, adminName, 'REJECT_REVIEW', 'Review', reviewId, before, { status: review_entity_1.ReviewStatus.REJECTED });
        return saved;
    }
    async flagReview(reviewId, reason, adminId, adminName) {
        const review = await this.findById(reviewId);
        const before = { status: review.status };
        review.status = review_entity_1.ReviewStatus.FLAGGED;
        review.flagReason = reason;
        const saved = await this.reviewRepo.save(review);
        await this.staffService.logAction(adminId, adminName, 'FLAG_REVIEW', 'Review', reviewId, before, { status: review_entity_1.ReviewStatus.FLAGGED, reason });
        return saved;
    }
    async respondToReview(reviewId, adminUserId, adminName, response) {
        const review = await this.findById(reviewId);
        review.adminResponse = response;
        review.respondedBy = adminUserId;
        review.respondedAt = new Date();
        const saved = await this.reviewRepo.save(review);
        await this.staffService.logAction(adminUserId, adminName, 'RESPOND_TO_REVIEW', 'Review', reviewId, null, { response });
        return saved;
    }
    async findById(id) {
        const review = await this.reviewRepo.findOne({ where: { id } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        staff_service_1.StaffService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map