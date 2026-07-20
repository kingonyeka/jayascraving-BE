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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
let S3Service = S3Service_1 = class S3Service {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(S3Service_1.name);
        this.s3 = new client_s3_1.S3Client({
            region: configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
            },
        });
        this.bucket = configService.get('S3_BUCKET');
        this.cloudfrontUrl = configService.get('CLOUDFRONT_URL');
    }
    async getPresignedUploadUrl(folder, mimeType, expiresIn = 300) {
        const ext = mimeType.split('/')[1] ?? 'bin';
        const key = `${folder}/${(0, uuid_1.v4)()}.${ext}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: mimeType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn });
        const publicUrl = `${this.cloudfrontUrl}/${key}`;
        return { uploadUrl, key, publicUrl };
    }
    async uploadBuffer(buffer, key, mimeType) {
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
        }));
        return `${this.cloudfrontUrl}/${key}`;
    }
    async generateThumbnail(imageBuffer, originalKey) {
        const thumbnailBuffer = await (0, sharp_1.default)(imageBuffer)
            .resize(400, 400, { fit: 'cover', position: 'centre' })
            .jpeg({ quality: 80 })
            .toBuffer();
        const thumbnailKey = originalKey.replace(/(\.[^.]+)$/, '_thumb.jpg');
        const thumbnailUrl = await this.uploadBuffer(thumbnailBuffer, thumbnailKey, 'image/jpeg');
        return { thumbnailKey, thumbnailUrl };
    }
    async deleteObject(key) {
        try {
            await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
            this.logger.log(`Deleted S3 object: ${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete S3 object ${key}: ${error?.message}`);
        }
    }
    getPublicUrl(key) {
        return `${this.cloudfrontUrl}/${key}`;
    }
    validateImageType(mimeType) {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        return allowed.includes(mimeType);
    }
    validateVideoType(mimeType) {
        const allowed = ['video/mp4', 'video/quicktime', 'video/webm'];
        return allowed.includes(mimeType);
    }
    getMaxFileSize(mimeType) {
        return mimeType.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map