import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
  @Query(() => String, { description: 'Simple health check ping' })
  ping(): string {
    return 'pong';
  }
}