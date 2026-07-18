import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaCategory, MediaFileType } from './entities/media.entity';
import { S3Service, PresignedUrlResult } from './s3.service';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
    private readonly s3Service: S3Service,
  ) {}

  // ─── Get presigned URL for client-side direct upload ──────────────────────

  async getUploadUrl(
    userId: string,
    mimeType: string,
    category: MediaCategory,
  ): Promise<PresignedUrlResult & { folder: string }> {
    const isImage = this.s3Service.validateImageType(mimeType);
    const isVideo = this.s3Service.validateVideoType(mimeType);

    if (!isImage && !isVideo) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, WebP, MP4, MOV, WebM',
      );
    }

    const folder = this.getFolderByCategory(category);
    const result = await this.s3Service.getPresignedUploadUrl(folder, mimeType);

    return { ...result, folder };
  }

  // ─── Save media record after client uploads to S3 ─────────────────────────

  async saveMediaRecord(
    userId: string,
    key: string,
    originalName: string,
    mimeType: string,
    size: number,
    category: MediaCategory,
    referenceId?: string,
  ): Promise<Media> {
    const isImage = this.s3Service.validateImageType(mimeType);
    const isVideo = this.s3Service.validateVideoType(mimeType);

    if (!isImage && !isVideo) {
      throw new BadRequestException('Invalid file type');
    }

    const maxSize = this.s3Service.getMaxFileSize(mimeType);
    if (size > maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${maxSize / 1024 / 1024}MB`,
      );
    }

    const url = this.s3Service.getPublicUrl(key);
    const fileType = isImage ? MediaFileType.IMAGE : MediaFileType.VIDEO;

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

  // ─── Get media by reference ────────────────────────────────────────────────

  async getByReference(referenceId: string): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { referenceId },
      order: { createdAt: 'ASC' },
    });
  }

  async getById(id: string): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  async getByUser(userId: string): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { uploadedBy: userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Delete media ──────────────────────────────────────────────────────────

  async delete(id: string, userId: string): Promise<boolean> {
    const media = await this.getById(id);

    if (media.uploadedBy !== userId) {
      throw new BadRequestException('You can only delete your own media');
    }

    await this.s3Service.deleteObject(media.key);
    if (media.thumbnailKey) {
      await this.s3Service.deleteObject(media.thumbnailKey);
    }

    await this.mediaRepo.remove(media);
    return true;
  }

  async adminDelete(id: string): Promise<boolean> {
    const media = await this.getById(id);
    await this.s3Service.deleteObject(media.key);
    if (media.thumbnailKey) {
      await this.s3Service.deleteObject(media.thumbnailKey);
    }
    await this.mediaRepo.remove(media);
    return true;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private getFolderByCategory(category: MediaCategory): string {
    const folders: Record<MediaCategory, string> = {
      [MediaCategory.PRODUCT]: 'products',
      [MediaCategory.REVIEW]: 'reviews',
      [MediaCategory.CUSTOM_ORDER]: 'custom-orders',
      [MediaCategory.CUSTOM_ORDER_PROOF]: 'custom-orders/proofs',
      [MediaCategory.AVATAR]: 'avatars',
      [MediaCategory.CATEGORY]: 'categories',
    };
    return folders[category] ?? 'misc';
  }
}