import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class QueueJobCounts {
  @Field(() => Int)
  waiting: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  failed: number;

  @Field(() => Int)
  delayed: number;
}

@ObjectType()
export class QueueStatsResult {
  @Field(() => QueueJobCounts)
  order: QueueJobCounts;

  @Field(() => QueueJobCounts)
  payment: QueueJobCounts;

  @Field(() => QueueJobCounts)
  inventory: QueueJobCounts;

  @Field(() => QueueJobCounts)
  cart: QueueJobCounts;
}
