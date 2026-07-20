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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const media_service_1 = require("./media.service");
const media_entity_1 = require("./entities/media.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let MediaController = class MediaController {
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async getPresignedUrl(req, mimeType, category) {
        if (!mimeType)
            throw new common_1.BadRequestException('mimeType is required');
        if (!category)
            throw new common_1.BadRequestException('category is required');
        return this.mediaService.getUploadUrl(req.user.id, mimeType, category);
    }
    async confirmUpload(req, key, originalName, mimeType, size, category, referenceId) {
        if (!key || !originalName || !mimeType || !size || !category) {
            throw new common_1.BadRequestException('key, originalName, mimeType, size and category are required');
        }
        return this.mediaService.saveMediaRecord(req.user.id, key, originalName, mimeType, Number(size), category, referenceId);
    }
    async getMedia(id) {
        return this.mediaService.getById(id);
    }
    async deleteMedia(req, id) {
        await this.mediaService.delete(id, req.user.id);
        return { success: true };
    }
    async adminDeleteMedia(id) {
        await this.mediaService.adminDelete(id);
        return { success: true };
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('presign'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('mimeType')),
    __param(2, (0, common_1.Body)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getPresignedUrl", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('key')),
    __param(2, (0, common_1.Body)('originalName')),
    __param(3, (0, common_1.Body)('mimeType')),
    __param(4, (0, common_1.Body)('size')),
    __param(5, (0, common_1.Body)('category')),
    __param(6, (0, common_1.Body)('referenceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number, String, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "confirmUpload", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMedia", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Delete)(':id/admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "adminDeleteMedia", null);
exports.MediaController = MediaController = __decorate([
    (0, common_1.Controller)('media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map