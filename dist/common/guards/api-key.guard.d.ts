import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
export declare const API_KEY_HEADER = "x-api-key";
export declare const REQUIRE_API_KEY = "requireApiKey";
export declare class ApiKeyGuard implements CanActivate {
    private readonly configService;
    private readonly reflector;
    private readonly logger;
    constructor(configService: ConfigService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
