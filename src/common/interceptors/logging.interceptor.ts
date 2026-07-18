import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    if (context.getType<GqlContextType>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const info = gqlCtx.getInfo();
      const user = gqlCtx.getContext().req?.user;

      return next.handle().pipe(
        tap({
          next: () => {
            const duration = Date.now() - start;
            this.logger.log(
              `[GraphQL] ${info.parentType.name}.${info.fieldName} | ${duration}ms | user: ${user?.id ?? 'guest'}`,
            );
          },
          error: (err) => {
            const duration = Date.now() - start;
            this.logger.error(
              `[GraphQL] ${info.parentType.name}.${info.fieldName} | ${duration}ms | user: ${user?.id ?? 'guest'} | error: ${err.message}`,
            );
          },
        }),
      );
    }

    // REST context
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.log(`[REST] ${method} ${url} | ${duration}ms`);
        },
        error: (err) => {
          const duration = Date.now() - start;
          this.logger.error(
            `[REST] ${method} ${url} | ${duration}ms | error: ${err.message}`,
          );
        },
      }),
    );
  }
}