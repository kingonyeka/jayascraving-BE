import { MediaService } from './media.service';
import { Media, MediaCategory } from './entities/media.entity';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    getPresignedUrl(req: any, mimeType: string, category: MediaCategory): Promise<import("./s3.service").PresignedUrlResult & {
        folder: string;
    }>;
    confirmUpload(req: any, key: string, originalName: string, mimeType: string, size: number, category: MediaCategory, referenceId?: string): Promise<Media>;
    getMedia(id: string): Promise<Media>;
    deleteMedia(req: any, id: string): Promise<{
        success: boolean;
    }>;
    adminDeleteMedia(id: string): Promise<{
        success: boolean;
    }>;
}
