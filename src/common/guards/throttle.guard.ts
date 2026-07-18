import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlContextType } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      return { req: ctx.req, res: ctx.res };
    }
    const http = context.switchToHttp();
    return { req: http.getRequest(), res: http.getResponse() };
  }

  protected getTracker(req: Record<string, any>): Promise<string> {
    // Use Express's own req.ip, which is only derived from X-Forwarded-For
    // when `app.set('trust proxy', N)` is configured (see main.ts) — i.e. only
    // as many hops deep as we actually trust. Reading the raw header directly
    // (the previous implementation) let any client spoof X-Forwarded-For and
    // get a fresh rate-limit bucket on every request, defeating throttling
    // entirely. req.connection?.remoteAddress is kept only as a last-resort
    // fallback for non-HTTP contexts where req.ip may be undefined.
    const ip = req.ip ?? req.connection?.remoteAddress ?? 'unknown';
    return Promise.resolve(ip);
  }
}