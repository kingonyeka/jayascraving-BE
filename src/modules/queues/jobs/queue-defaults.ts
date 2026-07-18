/**
 * Shared default job options for all Bull queues in this app.
 *
 * Previously this object was duplicated inline inside QueuesModule, and
 * AbandonedCartModule registered the same QUEUE_ABANDONED_CART queue name a
 * second time, independently, with NO default job options at all — meaning
 * jobs added through AbandonedCartService (the only place that actually
 * calls .add() on this queue) got no retry/backoff behavior, even though it
 * looked like they did from QueuesModule's registration.
 */
export const queueDefaults = {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
};
