import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { correlationStorage } from './logger.service';

export const REQUEST_ID_HEADER = 'x-request-id';
export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // use incoming request ID if provided, otherwise generate one
    const requestId =
      (req.headers[REQUEST_ID_HEADER] as string) ??
      (req.headers[CORRELATION_ID_HEADER] as string) ??
      uuidv4();

    // attach to response headers so client can trace
    res.setHeader(REQUEST_ID_HEADER, requestId);
    res.setHeader(CORRELATION_ID_HEADER, requestId);

    // run the rest of the request inside async local storage
    // so every log statement picks up this requestId automatically
    correlationStorage.run({ requestId }, () => {
      next();
    });
  }
}