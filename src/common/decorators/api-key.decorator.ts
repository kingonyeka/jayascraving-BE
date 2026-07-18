import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { REQUIRE_API_KEY } from '../guards/api-key.guard';
import { ApiKeyGuard } from '../guards/api-key.guard';

/**
 * Decorator for service-to-service endpoints that require an API key
 * Usage: @RequireApiKey() on a controller or route handler
 */
export const RequireApiKey = () =>
  applyDecorators(
    SetMetadata(REQUIRE_API_KEY, true),
    UseGuards(ApiKeyGuard),
  );