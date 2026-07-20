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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const google_auth_input_1 = require("./dto/google-auth.input");
const user_entity_1 = require("../users/entities/user.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const jwt_refresh_auth_guard_1 = require("../../common/guards/jwt-refresh-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthPayload = class AuthPayload {
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], AuthPayload.prototype, "accessToken", void 0);
__decorate([
    (0, graphql_2.Field)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], AuthPayload.prototype, "user", void 0);
AuthPayload = __decorate([
    (0, graphql_2.ObjectType)()
], AuthPayload);
let AuthResolver = class AuthResolver {
    constructor(authService) {
        this.authService = authService;
    }
    setRefreshCookie(res, refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: this.authService.getRefreshTokenTtlMs(),
        });
    }
    async googleAuth(input, ctx) {
        const result = await this.authService.loginWithGoogle(input.idToken);
        this.setRefreshCookie(ctx.res, result.refreshToken);
        return { accessToken: result.accessToken, user: result.user };
    }
    async refreshToken(ctx) {
        const rawRefreshToken = ctx.req.cookies?.refreshToken;
        if (!rawRefreshToken) {
            throw new Error('No refresh token found');
        }
        const result = await this.authService.refreshTokens(ctx.req.user?.sub, rawRefreshToken);
        this.setRefreshCookie(ctx.res, result.refreshToken);
        return { accessToken: result.accessToken, user: result.user };
    }
    async logout(user, ctx) {
        const rawRefreshToken = ctx.req.cookies?.refreshToken;
        ctx.res.clearCookie('refreshToken');
        return this.authService.logout(user.id, rawRefreshToken);
    }
    async logoutAll(user, ctx) {
        ctx.res.clearCookie('refreshToken');
        return this.authService.logoutAll(user.id);
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Mutation)(() => AuthPayload, { description: 'Sign in with Google ID token' }),
    (0, throttler_1.Throttle)({ auth: { limit: 10, ttl: 60000 } }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_auth_input_1.GoogleAuthInput, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "googleAuth", null);
__decorate([
    (0, graphql_1.Mutation)(() => AuthPayload, { description: 'Refresh access token using cookie' }),
    (0, throttler_1.Throttle)({ auth: { limit: 10, ttl: 60000 } }),
    (0, common_1.UseGuards)(jwt_refresh_auth_guard_1.JwtRefreshAuthGuard),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "refreshToken", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Log out from current device' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "logout", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Log out from all devices' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "logoutAll", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map