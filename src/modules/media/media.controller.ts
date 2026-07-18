import {
  Controller,
  Post,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { Media, MediaCategory } from './entities/media.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

// POST /api/media/presign  — get a presigned S3 upload URL (client uploads directly to S3)
// POST /api/media/confirm  — confirm upload and save the media record
// GET  /api/media/:id      — get a media record
// DELETE /api/media/:id    — delete a media record
//
// Previously this whole controller had no auth guard at all: any anonymous
// visitor could request upload URLs, create Media records pointing at any
// referenceId, read any media record by id, and delete any other anonymous
// upload (since unauthenticated calls all shared uploadedBy: 'guest').
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('presign')
  @HttpCode(HttpStatus.OK)
  async getPresignedUrl(
    @Request() req: any,
    @Body('mimeType') mimeType: string,
    @Body('category') category: MediaCategory,
  ) {
    if (!mimeType) throw new BadRequestException('mimeType is required');
    if (!category) throw new BadRequestException('category is required');

    return this.mediaService.getUploadUrl(req.user.id, mimeType, category);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.CREATED)
  async confirmUpload(
    @Request() req: any,
    @Body('key') key: string,
    @Body('originalName') originalName: string,
    @Body('mimeType') mimeType: string,
    @Body('size') size: number,
    @Body('category') category: MediaCategory,
    @Body('referenceId') referenceId?: string,
  ): Promise<Media> {
    if (!key || !originalName || !mimeType || !size || !category) {
      throw new BadRequestException('key, originalName, mimeType, size and category are required');
    }

    return this.mediaService.saveMediaRecord(
      req.user.id,
      key,
      originalName,
      mimeType,
      Number(size),
      category,
      referenceId,
    );
  }

  @Get(':id')
  async getMedia(@Param('id') id: string): Promise<Media> {
    return this.mediaService.getById(id);
  }

  @Delete(':id')
  async deleteMedia(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.mediaService.delete(id, req.user.id);
    return { success: true };
  }

  // Admin/staff force-delete — bypasses the "you can only delete your own
  // media" ownership check in MediaService.delete(). Previously
  // MediaService.adminDelete() was fully implemented but had no route
  // anywhere, so staff had no way to remove someone else's media (e.g. a
  // policy-violating review photo) through the API at all.
  @Delete(':id/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async adminDeleteMedia(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.mediaService.adminDelete(id);
    return { success: true };
  }
}
