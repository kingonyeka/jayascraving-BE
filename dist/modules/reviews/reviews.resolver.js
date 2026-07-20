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
exports.ReviewsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const reviews_service_1 = require("./reviews.service");
const review_entity_1 = require("./entities/review.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
const jwt_auth_guard_2 = require("../../common/guards/jwt-auth.guard");
let PaginatedReviews = class PaginatedReviews extends (0, paginated_result_type_1.PaginatedResult)(review_entity_1.Review) {
};
PaginatedReviews = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedReviews);
let RatingBreakdown = class RatingBreakdown {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RatingBreakdown.prototype, "star", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RatingBreakdown.prototype, "count", void 0);
RatingBreakdown = __decorate([
    (0, graphql_1.ObjectType)()
], RatingBreakdown);
let ProductRatingSummary = class ProductRatingSummary {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], ProductRatingSummary.prototype, "average", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ProductRatingSummary.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => [RatingBreakdown]),
    __metadata("design:type", Array)
], ProductRatingSummary.prototype, "breakdown", void 0);
ProductRatingSummary = __decorate([
    (0, graphql_1.ObjectType)()
], ProductRatingSummary);
let ReviewsResolver = class ReviewsResolver {
    constructor(reviewsService) {
        this.reviewsService = reviewsService;
    }
    productReviews(productId, pagination) {
        return this.reviewsService.getProductReviews(productId, pagination);
    }
    async productRatingSummary(productId) {
        const result = await this.reviewsService.getProductRatingSummary(productId);
        const breakdown = Object.entries(result.breakdown).map(([star, count]) => ({ star: Number(star), count }));
        return { average: result.average, total: result.total, breakdown };
    }
    myReviews(user) {
        return this.reviewsService.getMyReviews(user.id);
    }
    allReviews(status, pagination) {
        return this.reviewsService.getAllReviews(status, pagination);
    }
    createReview(user, productId, orderId, rating, comment, mediaUrls, mediaKeys) {
        return this.reviewsService.createReview(user.id, productId, orderId, rating, comment, mediaUrls ?? [], mediaKeys ?? []);
    }
    updateReview(user, reviewId, rating, comment) {
        return this.reviewsService.updateReview(reviewId, user.id, rating, comment);
    }
    deleteReview(user, reviewId) {
        return this.reviewsService.deleteReview(reviewId, user.id);
    }
    approveReview(user, reviewId) {
        return this.reviewsService.approveReview(reviewId, user.id, user.fullName);
    }
    rejectReview(user, reviewId) {
        return this.reviewsService.rejectReview(reviewId, user.id, user.fullName);
    }
    flagReview(user, reviewId, reason) {
        return this.reviewsService.flagReview(reviewId, reason, user.id, user.fullName);
    }
    respondToReview(user, reviewId, response) {
        return this.reviewsService.respondToReview(reviewId, user.id, user.fullName, response);
    }
};
exports.ReviewsResolver = ReviewsResolver;
__decorate([
    (0, graphql_1.Query)(() => PaginatedReviews, { description: 'Get approved reviews for a product' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "productReviews", null);
__decorate([
    (0, graphql_1.Query)(() => ProductRatingSummary, { description: 'Get rating summary for a product' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "productRatingSummary", null);
__decorate([
    (0, graphql_1.Query)(() => [review_entity_1.Review], { description: 'Get current user reviews' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "myReviews", null);
__decorate([
    (0, graphql_1.Query)(() => PaginatedReviews, { description: 'Admin: get all reviews' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('status', { type: () => review_entity_1.ReviewStatus, nullable: true })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "allReviews", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review, { description: 'Submit a product review' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('orderId', { type: () => graphql_1.ID })),
    __param(3, (0, graphql_1.Args)('rating', { type: () => graphql_1.Int })),
    __param(4, (0, graphql_1.Args)('comment', { nullable: true })),
    __param(5, (0, graphql_1.Args)('mediaUrls', { type: () => [String], nullable: true })),
    __param(6, (0, graphql_1.Args)('mediaKeys', { type: () => [String], nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String, Number, String, Array, Array]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "createReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review, { description: 'Update your own review' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('rating', { type: () => graphql_1.Int, nullable: true })),
    __param(3, (0, graphql_1.Args)('comment', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Number, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "updateReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Delete your own review' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "deleteReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review, { description: 'Admin: approve a review' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "approveReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review, { description: 'Admin: reject a review' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "rejectReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review, { description: 'Admin: flag a review' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "flagReview", null);
__decorate([
    (0, graphql_1.Mutation)(() => review_entity_1.Review, { description: 'Admin: respond to a review' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('reviewId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('response')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsResolver.prototype, "respondToReview", null);
exports.ReviewsResolver = ReviewsResolver = __decorate([
    (0, graphql_1.Resolver)(() => review_entity_1.Review),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsResolver);
//# sourceMappingURL=reviews.resolver.js.map