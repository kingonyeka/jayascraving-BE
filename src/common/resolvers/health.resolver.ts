import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String, {
    description: 'Simple liveness check for the GraphQL API.',
  })
  ping(): string {
    return 'pong';
  }
}