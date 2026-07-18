import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { createHash } from 'crypto';
import { User } from '../users/entities/user.entity';
import { Token } from './entities/token.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { RealTimeAnalyticsService } from '../real-time-analytics/real-time-analytics.service';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Parses simple duration strings like '15m', '30d', '1h', '45s' into
 * milliseconds. Falls back to treating a bare number as milliseconds.
 * Kept dependency-free (no `ms` package) — intentionally minimal, only
 * supports the units actually used by JWT_EXPIRES_IN / JWT_REFRESH_EXPIRES_IN.
 */
export function parseDurationToMs(value: string, fallbackMs: number): number {
  if (!value) return fallbackMs;
  const match = /^(\d+)\s*(ms|s|m|h|d)?$/i.exec(value.trim());
  if (!match) return fallbackMs;
  const amount = Number(match[1]);
  const unit = (match[2] ?? 'ms').toLowerCase();
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (multipliers[unit] ?? 1);
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Token) private readonly tokenRepo: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly realTimeAnalyticsService: RealTimeAnalyticsService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async loginWithGoogle(idToken: string): Promise<AuthResult> {
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
        role: UserRole.CUSTOMER,
        isActive: true,
      });
    } else {
      user.googleId = googlePayload.sub;
      user.fullName = googlePayload.name ?? user.fullName;
      user.avatarUrl = googlePayload.picture ?? user.avatarUrl;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been suspended');
    }

    user.lastLoginAt = new Date();
    user = await this.userRepo.save(user);

    // Previously RealTimeAnalyticsModule was marked @Global() specifically
    // so this could be injected, but never was — the live dashboard never
    // saw a NEW_CUSTOMER event.
    if (isNewUser) {
      this.realTimeAnalyticsService.emitNewCustomer({ id: user.id, email: user.email });
    }

    return this.issueTokens(user);
  }

  async refreshTokens(userId: string | undefined, rawRefreshToken: string): Promise<AuthResult> {
    if (!userId) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const storedToken = await this.tokenRepo.findOne({
      where: { tokenHash, userId, revoked: false },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // rotate — revoke old, issue new pair
    storedToken.revoked = true;
    await this.tokenRepo.save(storedToken);

    return this.issueTokens(user);
  }

  async logout(userId: string, rawRefreshToken: string): Promise<boolean> {
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.tokenRepo.update(
      { userId, tokenHash, revoked: false },
      { revoked: true },
    );
    return true;
  }

  async logoutAll(userId: string): Promise<boolean> {
    await this.tokenRepo.update({ userId, revoked: false }, { revoked: true });
    return true;
  }

  /** Cookie maxAge (ms) for the refresh-token cookie, derived from the same
   * config value used to sign the refresh JWT and set the DB expiry — kept
   * as a single source of truth so the cookie, the JWT, and the DB record
   * can never silently drift out of sync with each other. */
  getRefreshTokenTtlMs(): number {
    const jwtRefreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');
    return parseDurationToMs(jwtRefreshExpiresIn, 30 * 24 * 60 * 60 * 1000);
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const jwtSecret = this.configService.get<string>('jwt.secret');
    const jwtExpiresIn = this.configService.get<string>('jwt.expiresIn');
    const jwtRefreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const jwtRefreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn');

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: jwtSecret, expiresIn: jwtExpiresIn } as any,
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { secret: jwtRefreshSecret, expiresIn: jwtRefreshExpiresIn } as any,
    );

    // Previously hardcoded to "+30 days" regardless of config, which could
    // silently drift from JWT_REFRESH_EXPIRES_IN if that value was ever
    // changed. Now derived from the same config value used to sign the JWT.
    const expiresAt = new Date(Date.now() + this.getRefreshTokenTtlMs());

    await this.tokenRepo.save(
      this.tokenRepo.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      }),
    );

    return { accessToken, refreshToken, user };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Verifies a Google ID token server-side via Google's own library and
   * returns the decoded, trustworthy payload. Public (not private) so other
   * modules — e.g. StaffService when accepting a staff invite — can require
   * proof of Google account ownership instead of trusting client-supplied
   * `googleId`/`googleEmail` strings.
   */
  async verifyGoogleIdToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });
      const payload = ticket.getPayload();
      if (!payload?.email || !payload?.sub) {
        throw new UnauthorizedException('Invalid Google token payload');
      }
      // Google can issue tokens for unverified email addresses in some flows.
      // Trusting an unverified email for account linking/creation would let
      // someone claim an identity they don't actually control.
      if (payload.email_verified !== true) {
        throw new UnauthorizedException('Google account email is not verified');
      }
      return payload;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Google token verification failed');
    }
  }
}
