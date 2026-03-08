/**
 * Lightweight duplicate-submit guard.
 * If the same (normalizedName + phone) combination is submitted within
 * DEDUP_WINDOW_MS, the second request is rejected with 409.
 *
 * This is intentionally simple — it lives in a single process. For a
 * multi-process deployment, move this state to Redis.
 */

const DEDUP_WINDOW_MS = 10_000;

/** key → epoch ms of last accepted submission */
const recentSubmits = new Map<string, number>();

function dedupKey(name: string, phone: string): string {
  return `${name.toLowerCase()}:${phone}`;
}

/**
 * Returns true if this submission is a duplicate within the window.
 * Side-effect: records the submission timestamp when it is NOT a duplicate.
 */
export function checkDuplicate(name: string, phone: string): boolean {
  const key = dedupKey(name, phone);
  const now = Date.now();
  const last = recentSubmits.get(key);

  if (last !== undefined && now - last < DEDUP_WINDOW_MS) {
    return true; // duplicate
  }

  recentSubmits.set(key, now);

  // Periodic cleanup to prevent unbounded growth under high volume
  if (recentSubmits.size > 2000) {
    for (const [k, ts] of recentSubmits) {
      if (now - ts > DEDUP_WINDOW_MS) recentSubmits.delete(k);
    }
  }

  return false;
}

/** Reset dedup state — for test teardown only. */
export function _resetDedup(): void {
  recentSubmits.clear();
}
