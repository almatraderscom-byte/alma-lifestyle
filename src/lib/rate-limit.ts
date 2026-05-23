/**
 * In-memory sliding-window rate limiter for API routes.
 * Suitable for single-region serverless; use Redis/Upstash for multi-instance strict limits.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Prune stale buckets periodically to avoid unbounded memory growth. */
const PRUNE_EVERY = 500;
let requestsSincePrune = 0;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec?: number;
}

/**
 * @param key - Unique key (e.g. `api:ip:write`)
 * @param limit - Max requests per window
 * @param windowMs - Window length in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  requestsSincePrune += 1;
  if (requestsSincePrune >= PRUNE_EVERY) {
    requestsSincePrune = 0;
    prune(now);
  }

  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { ok: true };
}
