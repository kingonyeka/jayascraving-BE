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
exports.InAppNotificationsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const in_app_notifications_service_1 = require("./in-app-notifications.service");
const notification_entity_1 = require("./entities/notification.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
let PaginatedNotifications = class PaginatedNotifications extends (0, paginated_result_type_1.PaginatedResult)(notification_entity_1.Notification) {
};
PaginatedNotifications = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedNotifications);
let NotificationSummary = class NotificationSummary {
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], NotificationSummary.prototype, "unreadCount", void 0);
NotificationSummary = __decorate([
    (0, graphql_1.ObjectType)()
], NotificationSummary);
let InAppNotificationsResolver = class InAppNotificationsResolver {
    constructor(service) {
        this.service = service;
    }
    myNotifications(user, pagination) {
        return this.service.getForUser(user.id, pagination);
    }
    async notificationSummary(user) {
        const unreadCount = await this.service.getUnreadCount(user.id);
        return { unreadCount };
    }
    markNotificationRead(user, notificationId) {
        return this.service.markAsRead(notificationId, user.id);
    }
    markAllNotificationsRead(user) {
        return this.service.markAllAsRead(user.id);
    }
    deleteNotification(user, notificationId) {
        return this.service.delete(notificationId, user.id);
    }
    clearReadNotifications(user) {
        return this.service.clearRead(user.id);
    }
};
exports.InAppNotificationsResolver = InAppNotificationsResolver;
__decorate([
    (0, graphql_1.Query)(() => PaginatedNotifications, { description: 'Get current user notifications' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], InAppNotificationsResolver.prototype, "myNotifications", null);
__decorate([
    (0, graphql_1.Query)(() => NotificationSummary, { description: 'Get unread notification count' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], InAppNotificationsResolver.prototype, "notificationSummary", null);
__decorate([
    (0, graphql_1.Mutation)(() => notification_entity_1.Notification, { description: 'Mark a notification as read' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('notificationId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], InAppNotificationsResolver.prototype, "markNotificationRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_1.Int, { description: 'Mark all notifications as read' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], InAppNotificationsResolver.prototype, "markAllNotificationsRead", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Delete a notification' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('notificationId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], InAppNotificationsResolver.prototype, "deleteNotification", null);
__decorate([
    (0, graphql_1.Mutation)(() => graphql_1.Int, { description: 'Clear all read notifications' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], InAppNotificationsResolver.prototype, "clearReadNotifications", null);
exports.InAppNotificationsResolver = InAppNotificationsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [in_app_notifications_service_1.InAppNotificationsService])
], InAppNotificationsResolver);
//# sourceMappingURL=in-app-notifications.resolver.js.map