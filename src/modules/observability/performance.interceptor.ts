import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

const SLOW_REQUEST_THRESHOLD_MS = 500; // warn if request takes > 500ms
const VERY_SLOW_THRESHOLD_MS = 2000;   // error if request takes > 2s

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const label = this.getLabel(context);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logDuration(label, duration);
        },
        error: () => {
          const duration = Date.now() - start;
          this.logDuration(label, duration);
        },
      }),
    );
  }

  private getLabel(context: ExecutionContext): string {
    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();
      return `GraphQL ${info.parentType.name}.${info.fieldName}`;
    }
    const req = context.switchToHttp().getRequest();
    return `${req.method} ${req.url}`;
  }

  private logDuration(label: string, duration: number) {
    if (duration >= VERY_SLOW_THRESHOLD_MS) {
      this.logger.error(
        `VERY SLOW [${duration}ms] ${label} — investigate immediately`,
      );
    } else if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
      this.logger.warn(`SLOW [${duration}ms] ${label}`);
    } else if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`[${duration}ms] ${label}`);
    }
  }
}