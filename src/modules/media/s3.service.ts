import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly cloudfrontUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = configService.get<string>('S3_BUCKET');
    this.cloudfrontUrl = configService.get<string>('CLOUDFRONT_URL');
  }

  // ─── Generate presigned URL for direct client upload ──────────────────────

  async getPresignedUploadUrl(
    folder: string,
    mimeType: string,
    expiresIn = 300,
  ): Promise<PresignedUrlResult> {
    const ext = mimeType.split('/')[1] ?? 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn });
    const publicUrl = `${this.cloudfrontUrl}/${key}`;

    return { uploadUrl, key, publicUrl };
  }

  // ─── Upload buffer directly (server-side, e.g. thumbnails) ────────────────

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    mimeType: string,
  ): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return `${this.cloudfrontUrl}/${key}`;
  }

  // ─── Generate image thumbnail via sharp ───────────────────────────────────

  async generateThumbnail(
    imageBuffer: Buffer,
    originalKey: string,
  ): Promise<{ thumbnailKey: string; thumbnailUrl: string }> {
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(400, 400, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailKey = originalKey.replace(
      /(\.[^.]+)$/,
      '_thumb.jpg',
    );

    const thumbnailUrl = await this.uploadBuffer(
      thumbnailBuffer,
      thumbnailKey,
      'image/jpeg',
    );

    return { thumbnailKey, thumbnailUrl };
  }

  // ─── Delete object from S3 ─────────────────────────────────────────────────

  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted S3 object: ${key}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete S3 object ${key}: ${error?.message}`);
    }
  }

  // ─── Get CloudFront URL from key ──────────────────────────────────────────

  getPublicUrl(key: string): string {
    return `${this.cloudfrontUrl}/${key}`;
  }

  // ─── Validate file type ────────────────────────────────────────────────────

  validateImageType(mimeType: string): boolean {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    return allowed.includes(mimeType);
  }

  validateVideoType(mimeType: string): boolean {
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm'];
    return allowed.includes(mimeType);
  }

  getMaxFileSize(mimeType: string): number {
    return mimeType.startsWith('video/') ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
  }
}