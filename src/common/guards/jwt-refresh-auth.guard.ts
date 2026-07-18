import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guards the refresh-token mutation using the 'jwt-refresh' Passport strategy
 * (JwtRefreshStrategy), which validates the refresh-token cookie and attaches
 * `{ sub, refreshToken }` to `req.user`.
 *
 * Previously, JwtRefreshStrategy was registered as a provider but never
 * actually wired to a guard anywhere, so `AuthResolver.refreshToken()` ran
 * with no authentication at all and `ctx.req.user` was always undefined.
 */
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Refresh token is missing or invalid');
    }
    return user;
  }
}
