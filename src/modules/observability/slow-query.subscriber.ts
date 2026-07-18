import {
  EventSubscriber,
  EntitySubscriberInterface,
} from 'typeorm';
import { Logger } from '@nestjs/common';

const SLOW_QUERY_THRESHOLD_MS = 100; // log queries taking longer than 100ms

// TypeORM doesn't have a native slow query subscriber but we can
// wrap the query runner at the connection level
// This subscriber logs all queries in development and flags slow ones

@EventSubscriber()
export class SlowQuerySubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger('SlowQuery');

  // called before every query
  beforeQuery(event: { query: string; parameters?: any[] }) {
    (event as any).__startTime = Date.now();
  }

  // called after every query
  afterQuery(event: { query: string; parameters?: any[]; executionTime?: number }) {
    const duration = event.executionTime ?? (Date.now() - ((event as any).__startTime ?? Date.now()));

    if (duration >= SLOW_QUERY_THRESHOLD_MS) {
      this.logger.warn(
        `SLOW QUERY [${duration}ms]: ${event.query.substring(0, 200)}${event.query.length > 200 ? '...' : ''}`,
      );
    }
  }
}