import { Repository } from 'typeorm';
import { Media, MediaCategory } from './entities/media.entity';
import { S3Service, PresignedUrlResult } from './s3.service';
export declare class MediaService {
    private readonly mediaRepo;
    private readonly s3Service;
    constructor(mediaRepo: Repository<Media>, s3Service: S3Service);
    getUploadUrl(userId: string, mimeType: string, category: MediaCategory): Promise<PresignedUrlResult & {
        folder: string;
    }>;
    saveMediaRecord(userId: string, key: string, originalName: string, mimeType: string, size: number, category: MediaCategory, referenceId?: string): Promise<Media>;
    getByReference(referenceId: string): Promise<Media[]>;
    getById(id: string): Promise<Media>;
    getByUser(userId: string): Promise<Media[]>;
    delete(id: string, userId: string): Promise<boolean>;
    adminDelete(id: string): Promise<boolean>;
    private getFolderByCategory;
}
