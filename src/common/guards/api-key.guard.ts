import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

export const API_KEY_HEADER = 'x-api-key';
export const REQUIRE_API_KEY = 'requireApiKey';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requireApiKey = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_API_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireApiKey) return true;

    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers[API_KEY_HEADER];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const validKey = this.configService.get<string>('INTERNAL_API_KEY');

    if (!validKey || apiKey !== validKey) {
      this.logger.warn(`Invalid API key attempt from ${req.ip}`);
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}