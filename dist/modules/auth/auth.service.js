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
exports.AuthService = void 0;
exports.parseDurationToMs = parseDurationToMs;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const google_auth_library_1 = require("google-auth-library");
const crypto_1 = require("crypto");
const user_entity_1 = require("../users/entities/user.entity");
const token_entity_1 = require("./entities/token.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const real_time_analytics_service_1 = require("../real-time-analytics/real-time-analytics.service");
function parseDurationToMs(value, fallbackMs) {
    if (!value)
        return fallbackMs;
    const match = /^(\d+)\s*(ms|s|m|h|d)?$/i.exec(value.trim());
    if (!match)
        return fallbackMs;
    const amount = Number(match[1]);
    const unit = (match[2] ?? 'ms').toLowerCase();
    const multipliers = {
        ms: 1,
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };
    return amount * (multipliers[unit] ?? 1);
}
let AuthService = class AuthService {
    constructor(userRepo, tokenRepo, jwtService, configService, realTimeAnalyticsService) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.jwtService = jwtService;
        this.configService = configService;
        this.realTimeAnalyticsService = realTimeAnalyticsService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
    }
    async loginWithGoogle(idToken) {
        const googlePayload = await this.verifyGoogleIdToken(idToken);
        let user = await this.userRepo.findOne({
            where: { googleId: googlePayload.sub },
        });
        if (!user) {
            user = await this.userRepo.findOne({
                where: { email: googlePayload.email },
            });
        }
        const isNewUser = !user;
        if (!user) {
            user = this.userRepo.create({
                email: googlePayload.email,
                fullName: googlePayload.name,
                avatarUrl: googlePayload.picture,
                googleId: googlePayload.sub,
                role: user_role_enum_1.UserRole.CUSTOMER,
                isActive: true,
            });
        }
        else {
            user.googleId = googlePayload.sub;
            user.fullName = googlePayload.name ?? user.fullName;
            user.avatarUrl = googlePayload.picture ?? user.avatarUrl;
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('This account has been suspended');
        }
        user.lastLoginAt = new Date();
        user = await this.userRepo.save(user);
        if (isNewUser) {
            this.realTimeAnalyticsService.emitNewCustomer({ id: user.id, email: user.email });
        }
        return this.issueTokens(user);
    }
    async refreshTokens(userId, rawRefreshToken) {
        if (!userId) {
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
        const tokenHash = this.hashToken(rawRefreshToken);
        const storedToken = await this.tokenRepo.findOne({
            where: { tokenHash, userId, revoked: false },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        storedToken.revoked = true;
        await this.tokenRepo.save(storedToken);
        return this.issueTokens(user);
    }
    async logout(userId, rawRefreshToken) {
        const tokenHash = this.hashToken(rawRefreshToken);
        await this.tokenRepo.update({ userId, tokenHash, revoked: false }, { revoked: true });
        return true;
    }
    async logoutAll(userId) {
        await this.tokenRepo.update({ userId, revoked: false }, { revoked: true });
        return true;
    }
    getRefreshTokenTtlMs() {
        const jwtRefreshExpiresIn = this.configService.get('jwt.refreshExpiresIn');
        return parseDurationToMs(jwtRefreshExpiresIn, 30 * 24 * 60 * 60 * 1000);
    }
    async issueTokens(user) {
        const jwtSecret = this.configService.get('jwt.secret');
        const jwtExpiresIn = this.configService.get('jwt.expiresIn');
        const jwtRefreshSecret = this.configService.get('jwt.refreshSecret');
        const jwtRefreshExpiresIn = this.configService.get('jwt.refreshExpiresIn');
        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { secret: jwtSecret, expiresIn: jwtExpiresIn });
        const refreshToken = this.jwtService.sign({ sub: user.id }, { secret: jwtRefreshSecret, expiresIn: jwtRefreshExpiresIn });
        const expiresAt = new Date(Date.now() + this.getRefreshTokenTtlMs());
        await this.tokenRepo.save(this.tokenRepo.create({
            userId: user.id,
            tokenHash: this.hashToken(refreshToken),
            expiresAt,
        }));
        return { accessToken, refreshToken, user };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async verifyGoogleIdToken(idToken) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload?.email || !payload?.sub) {
                throw new common_1.UnauthorizedException('Invalid Google token payload');
            }
            if (payload.email_verified !== true) {
                throw new common_1.UnauthorizedException('Google account email is not verified');
            }
            return payload;
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.UnauthorizedException('Google token verification failed');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(token_entity_1.Token)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        real_time_analytics_service_1.RealTimeAnalyticsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map