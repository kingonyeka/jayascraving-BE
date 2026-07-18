import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { GoogleAuthInput } from './dto/google-auth.input';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from '../../common/guards/jwt-refresh-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Response } from 'express';

@ObjectType()
class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.authService.getRefreshTokenTtlMs(),
    });
  }

  @Mutation(() => AuthPayload, { description: 'Sign in with Google ID token' })
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  async googleAuth(
    @Args('input') input: GoogleAuthInput,
    @Context() ctx: { res: Response },
  ): Promise<AuthPayload> {
    const result = await this.authService.loginWithGoogle(input.idToken);
    this.setRefreshCookie(ctx.res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Mutation(() => AuthPayload, { description: 'Refresh access token using cookie' })
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(@Context() ctx: { req: any; res: Response }): Promise<AuthPayload> {
    const rawRefreshToken = ctx.req.cookies?.refreshToken;
    if (!rawRefreshToken) {
      throw new Error('No refresh token found');
    }

    // ctx.req.user is now populated by JwtRefreshAuthGuard (jwt-refresh
    // Passport strategy) — previously this guard was never applied, so
    // ctx.req.user was always undefined and every refresh silently skipped
    // per-user token scoping.
    const result = await this.authService.refreshTokens(
      ctx.req.user?.sub,
      rawRefreshToken,
    );

    this.setRefreshCookie(ctx.res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Mutation(() => Boolean, { description: 'Log out from current device' })
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: User,
    @Context() ctx: { req: any; res: Response },
  ): Promise<boolean> {
    const rawRefreshToken = ctx.req.cookies?.refreshToken;
    ctx.res.clearCookie('refreshToken');
    return this.authService.logout(user.id, rawRefreshToken);
  }

  @Mutation(() => Boolean, { description: 'Log out from all devices' })
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @CurrentUser() user: User,
    @Context() ctx: { res: Response },
  ): Promise<boolean> {
    ctx.res.clearCookie('refreshToken');
    return this.authService.logoutAll(user.id);
  }
}
