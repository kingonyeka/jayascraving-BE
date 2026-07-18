import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { createHash } from 'crypto';
import { Request, Response } from 'express';

/**
 * ETag interceptor for REST endpoints
 * Generates an ETag from the response body
 * If client sends matching If-None-Match header, returns 304 Not Modified
 * Saves bandwidth for unchanged responses (e.g. product listings, settings)
 */
@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // only apply to HTTP GET requests
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    if (req.method !== 'GET') return next.handle();

    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        const body = JSON.stringify(data);
        const etag = `"${createHash('md5').update(body).digest('hex')}"`;

        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', 'no-cache'); // must revalidate with server

        const clientEtag = req.headers['if-none-match'];
        if (clientEtag && clientEtag === etag) {
          res.status(304).end();
          return null;
        }

        return data;
      }),
    );
  }
}