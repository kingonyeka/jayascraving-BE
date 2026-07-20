import { Request, Response } from 'express';
import { RealTimeAnalyticsService } from './real-time-analytics.service';
export declare class RealTimeAnalyticsController {
    private readonly analyticsService;
    private readonly logger;
    constructor(analyticsService: RealTimeAnalyticsService);
    liveStream(req: Request, res: Response): Promise<void>;
}
