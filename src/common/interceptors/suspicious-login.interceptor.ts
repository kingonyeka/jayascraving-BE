import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';

// lightweight in-memory store for login attempts
// in production replace with Redis for multi-instance support
const loginAttempts = new Map<string, { count: number; firstAttempt: Date; lastAttempt: Date }>();

const MAX_ATTEMPTS = 10; // max login attempts per IP per window
const WINDOW_MINUTES = 15; // rolling window in minutes

@Injectable()
export class SuspiciousLoginInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SuspiciousLoginInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ip = this.extractIp(context);
    const handler = context.getHandler().name;

    // only apply to auth-related resolvers
    const authHandlers = ['googleAuth', 'refreshToken', 'login'];
    if (!authHandlers.includes(handler)) return next.handle();

    const now = new Date();
    const record = loginAttempts.get(ip);

    if (record) {
      const windowExpiry = new Date(record.firstAttempt);
      windowExpiry.setMinutes(windowExpiry.getMinutes() + WINDOW_MINUTES);

      if (now > windowExpiry) {
        // window expired — reset
        loginAttempts.delete(ip);
      } else if (record.count >= MAX_ATTEMPTS) {
        this.logger.warn(
          `Suspicious login activity detected from IP: ${ip} — ${record.count} attempts in ${WINDOW_MINUTES} minutes`,
        );
        // don't block — just log. To block, throw new TooManyRequestsException here
      }
    }

    return next.handle().pipe(
      tap({
        next: () => {
          // successful login — reset counter for this IP
          loginAttempts.delete(ip);
        },
        error: () => {
          // failed attempt — increment counter
          const existing = loginAttempts.get(ip);
          if (existing) {
            existing.count += 1;
            existing.lastAttempt = now;
          } else {
            loginAttempts.set(ip, { count: 1, firstAttempt: now, lastAttempt: now });
          }
          this.logger.warn(
            `Failed login attempt from IP: ${ip} — handler: ${handler} — total: ${loginAttempts.get(ip)?.count}`,
          );
        },
      }),
    );
  }

  private extractIp(context: ExecutionContext): string {
    if (context.getType<GqlContextType>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context).getContext();
      const req = ctx.req;
      return (
        req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
        req?.ip ??
        'unknown'
      );
    }
    const req = context.switchToHttp().getRequest();
    return (
      req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
      req?.ip ??
      'unknown'
    );
  }
}