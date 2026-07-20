import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    key: string;
    url: string;
    thumbnailKey?: string;
    thumbnailUrl?: string;
}
export interface PresignedUrlResult {
    uploadUrl: string;
    key: string;
    publicUrl: string;
}
export declare class S3Service {
    private readonly configService;
    private readonly logger;
    private readonly s3;
    private readonly bucket;
    private readonly cloudfrontUrl;
    constructor(configService: ConfigService);
    getPresignedUploadUrl(folder: string, mimeType: string, expiresIn?: number): Promise<PresignedUrlResult>;
    uploadBuffer(buffer: Buffer, key: string, mimeType: string): Promise<string>;
    generateThumbnail(imageBuffer: Buffer, originalKey: string): Promise<{
        thumbnailKey: string;
        thumbnailUrl: string;
    }>;
    deleteObject(key: string): Promise<void>;
    getPublicUrl(key: string): string;
    validateImageType(mimeType: string): boolean;
    validateVideoType(mimeType: string): boolean;
    getMaxFileSize(mimeType: string): number;
}
