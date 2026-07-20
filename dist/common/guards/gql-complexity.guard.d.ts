import type { ApolloServerPlugin } from '@apollo/server';
export declare const MAX_COMPLEXITY = 1000;
export declare function createComplexityPlugin(maxComplexity?: number): ApolloServerPlugin;
