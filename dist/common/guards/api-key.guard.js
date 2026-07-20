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
var ApiKeyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = exports.REQUIRE_API_KEY = exports.API_KEY_HEADER = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
exports.API_KEY_HEADER = 'x-api-key';
exports.REQUIRE_API_KEY = 'requireApiKey';
let ApiKeyGuard = ApiKeyGuard_1 = class ApiKeyGuard {
    constructor(configService, reflector) {
        this.configService = configService;
        this.reflector = reflector;
        this.logger = new common_1.Logger(ApiKeyGuard_1.name);
    }
    canActivate(context) {
        const requireApiKey = this.reflector.getAllAndOverride(exports.REQUIRE_API_KEY, [context.getHandler(), context.getClass()]);
        if (!requireApiKey)
            return true;
        const req = context.switchToHttp().getRequest();
        const apiKey = req.headers[exports.API_KEY_HEADER];
        if (!apiKey) {
            throw new common_1.UnauthorizedException('API key is required');
        }
        const validKey = this.configService.get('INTERNAL_API_KEY');
        if (!validKey || apiKey !== validKey) {
            this.logger.warn(`Invalid API key attempt from ${req.ip}`);
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = ApiKeyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        core_1.Reflector])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map