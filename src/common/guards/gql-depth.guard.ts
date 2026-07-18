import { Logger } from '@nestjs/common';
import depthLimit from 'graphql-depth-limit';

const logger = new Logger('GqlDepthLimit');

/**
 * GraphQL query depth limit — prevents deeply nested malicious queries
 *
 * Example of a query that would be BLOCKED (depth > 7):
 * {
 *   orders {                    depth 1
 *     items {                   depth 2
 *       product {               depth 3
 *         category {            depth 4
 *           products {          depth 5
 *             variants {        depth 6
 *               product {       depth 7
 *                 media { ... } depth 8 ← BLOCKED
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * Usage: add to GraphQLModule validationRules in app.module.ts
 */
export const DepthLimitRule = depthLimit(
  7,  // max allowed query depth
  { ignore: ['__schema', '__type'] }, // allow introspection queries (needed for playground)
  (depths) => {
    // called after validation — log queries approaching the limit.
    // Uses the structured Nest logger (routes to Sentry/log aggregation)
    // instead of console.warn, which bypassed that pipeline entirely.
    Object.entries(depths).forEach(([queryName, depth]) => {
      if ((depth as number) >= 5) {
        logger.warn(`Deep GraphQL query detected: ${queryName} has depth ${depth}`);
      }
    });
  },
);
