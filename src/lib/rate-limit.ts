// In-memory limiter — used only when Upstash env is not set (local dev).
// DO NOT rely on this in production.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const PRUNE_EVERY = 500;
let requestsSincePrune = 0;

const KIND_LIMITS = {
  read: { limit: 150, windowMs: 60_000 },
  write: { limit: 40, windowMs: 60_000 },
  auth: { limit: 5, windowMs: 60_000 },
} as const;

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  reset: number;
  remaining: number;
  limit: number;
  retryAfterSec?: number;
}

function rateLimitKey(identifier: string, kind: keyof typeof KIND_LIMITS): string {
  return `api:${kind}:${identifier}`;
}

/**
 * @deprecated Prefer Upstash via middleware; dev fallback only.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec?: number } {
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

/** In-memory sliding window for local dev when Upstash is not configured. */
export function checkRateLimit(
  identifier: string,
  kind: keyof typeof KIND_LIMITS
): RateLimitResult {
  const { limit, windowMs } = KIND_LIMITS[kind];
  const key = rateLimitKey(identifier, kind);
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
  const remaining = Math.max(0, limit - bucket.count);
  const resetUnixSec = Math.ceil(bucket.resetAt / 1000);

  if (bucket.count > limit) {
    return {
      ok: false,
      reset: resetUnixSec,
      remaining: 0,
      limit,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return {
    ok: true,
    reset: resetUnixSec,
    remaining,
    limit,
  };
}
