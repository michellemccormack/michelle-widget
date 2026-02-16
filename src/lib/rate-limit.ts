/**
 * Rate limiting: 20 requests per IP per minute.
 */

import { Redis } from '@upstash/redis';
import { logger } from './logger';

const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '20', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const RATE_LIMIT_WINDOW_SEC = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    logger.warn('Redis not configured - rate limiting disabled');
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) {
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: RATE_LIMIT_WINDOW_SEC };
  }

  const key = `rate:${identifier}`;

  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, RATE_LIMIT_WINDOW_SEC);
    }
    const ttl = await client.ttl(key);
    const resetIn = ttl > 0 ? ttl : RATE_LIMIT_WINDOW_SEC;

    const allowed = count <= RATE_LIMIT_MAX;
    const remaining = Math.max(0, RATE_LIMIT_MAX - count);

    return { allowed, remaining, resetIn };
  } catch (error) {
    logger.error('Rate limit check failed', error);
    return { allowed: true, remaining: RATE_LIMIT_MAX, resetIn: RATE_LIMIT_WINDOW_SEC };
  }
}
