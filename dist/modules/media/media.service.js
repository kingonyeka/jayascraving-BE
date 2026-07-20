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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("./entities/media.entity");
const s3_service_1 = require("./s3.service");
let MediaService = class MediaService {
    constructor(mediaRepo, s3Service) {
        this.mediaRepo = mediaRepo;
        this.s3Service = s3Service;
    }
    async getUploadUrl(userId, mimeType, category) {
        const isImage = this.s3Service.validateImageType(mimeType);
        const isVideo = this.s3Service.validateVideoType(mimeType);
        if (!isImage && !isVideo) {
            throw new common_1.BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, MP4, MOV, WebM');
        }
        const folder = this.getFolderByCategory(category);
        const result = await this.s3Service.getPresignedUploadUrl(folder, mimeType);
        return { ...result, folder };
    }
    async saveMediaRecord(userId, key, originalName, mimeType, size, category, referenceId) {
        const isImage = this.s3Service.validateImageType(mimeType);
        const isVideo = this.s3Service.validateVideoType(mimeType);
        if (!isImage && !isVideo) {
            throw new common_1.BadRequestException('Invalid file type');
        }
        const maxSize = this.s3Service.getMaxFileSize(mimeType);
        if (size > maxSize) {
            throw new common_1.BadRequestException(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
        }
        const url = this.s3Service.getPublicUrl(key);
        const fileType = isImage ? media_entity_1.MediaFileType.IMAGE : media_entity_1.MediaFileType.VIDEO;
        const media = this.mediaRepo.create({
            uploadedBy: userId,
            key,
            url,
            originalName,
            mimeType,
            size,
            fileType,
            category,
            referenceId,
        });
        return this.mediaRepo.save(media);
    }
    async getByReference(referenceId) {
        return this.mediaRepo.find({
            where: { referenceId },
            order: { createdAt: 'ASC' },
        });
    }
    async getById(id) {
        const media = await this.mediaRepo.findOne({ where: { id } });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        return media;
    }
    async getByUser(userId) {
        return this.mediaRepo.find({
            where: { uploadedBy: userId },
            order: { createdAt: 'DESC' },
        });
    }
    async delete(id, userId) {
        const media = await this.getById(id);
        if (media.uploadedBy !== userId) {
            throw new common_1.BadRequestException('You can only delete your own media');
        }
        await this.s3Service.deleteObject(media.key);
        if (media.thumbnailKey) {
            await this.s3Service.deleteObject(media.thumbnailKey);
        }
        await this.mediaRepo.remove(media);
        return true;
    }
    async adminDelete(id) {
        const media = await this.getById(id);
        await this.s3Service.deleteObject(media.key);
        if (media.thumbnailKey) {
            await this.s3Service.deleteObject(media.thumbnailKey);
        }
        await this.mediaRepo.remove(media);
        return true;
    }
    getFolderByCategory(category) {
        const folders = {
            [media_entity_1.MediaCategory.PRODUCT]: 'products',
            [media_entity_1.MediaCategory.REVIEW]: 'reviews',
            [media_entity_1.MediaCategory.CUSTOM_ORDER]: 'custom-orders',
            [media_entity_1.MediaCategory.CUSTOM_ORDER_PROOF]: 'custom-orders/proofs',
            [media_entity_1.MediaCategory.AVATAR]: 'avatars',
            [media_entity_1.MediaCategory.CATEGORY]: 'categories',
        };
        return folders[category] ?? 'misc';
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        s3_service_1.S3Service])
], MediaService);
//# sourceMappingURL=media.service.js.map