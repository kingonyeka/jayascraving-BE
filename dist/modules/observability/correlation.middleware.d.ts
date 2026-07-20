import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare const REQUEST_ID_HEADER = "x-request-id";
export declare const CORRELATION_ID_HEADER = "x-correlation-id";
export declare class CorrelationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
