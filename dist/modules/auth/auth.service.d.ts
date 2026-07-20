import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'google-auth-library';
import { User } from '../users/entities/user.entity';
import { Token } from './entities/token.entity';
import { RealTimeAnalyticsService } from '../real-time-analytics/real-time-analytics.service';
export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    user: User;
}
export declare function parseDurationToMs(value: string, fallbackMs: number): number;
export declare class AuthService {
    private readonly userRepo;
    private readonly tokenRepo;
    private readonly jwtService;
    private readonly configService;
    private readonly realTimeAnalyticsService;
    private readonly googleClient;
    constructor(userRepo: Repository<User>, tokenRepo: Repository<Token>, jwtService: JwtService, configService: ConfigService, realTimeAnalyticsService: RealTimeAnalyticsService);
    loginWithGoogle(idToken: string): Promise<AuthResult>;
    refreshTokens(userId: string | undefined, rawRefreshToken: string): Promise<AuthResult>;
    logout(userId: string, rawRefreshToken: string): Promise<boolean>;
    logoutAll(userId: string): Promise<boolean>;
    getRefreshTokenTtlMs(): number;
    private issueTokens;
    private hashToken;
    verifyGoogleIdToken(idToken: string): Promise<TokenPayload>;
}
