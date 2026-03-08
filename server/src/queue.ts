import { Party } from './types';

/**
 * In-memory FIFO queue. Resets on server restart — acceptable per spec.
 * For persistence, swap this module for a Redis-backed implementation.
 */
export const queue: Party[] = [];

/** Remove all entries. Exposed for test teardown. */
export function clearQueue(): void {
  queue.length = 0;
}
