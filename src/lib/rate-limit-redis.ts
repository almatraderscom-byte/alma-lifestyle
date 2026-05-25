import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const hasUpstashConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstashConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/** Limits — match middleware: 40 write / 150 read per identifier per minute; 5 auth. */
export const writeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(40, '1 m'),
      analytics: false,
      prefix: 'rl:write',
    })
  : null;

export const readLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(150, '1 m'),
      analytics: false,
      prefix: 'rl:read',
    })
  : null;

export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: false,
      prefix: 'rl:auth',
    })
  : null;

export const isUpstashEnabled = hasUpstashConfig;
