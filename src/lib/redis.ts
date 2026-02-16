/**
 * Redis caching utilities.
 * TTLs: faqs 5min, config 10min, embeddings 1hr, session 30min, rate 1min.
 */

import { Redis } from '@upstash/redis';
import { logger } from './logger';

const TTL = {
  FAQS: 60 * 5,
  CONFIG: 60 * 10,
  EMBEDDINGS: 60 * 60,
  SESSION: 60 * 30,
  RATE: 60,
} as const;

export const CACHE_KEYS = {
  faqs: () => 'faqs:all',
  config: () => 'config:all',
  embeddings: () => 'embeddings:all',
  session: (id: string) => `session:${id}`,
  rate: (ip: string) => `rate:${ip}`,
} as const;

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export const cacheUtils = {
  async get<T>(key: string): Promise<T | null> {
    const client = getRedis();
    if (!client) return null;
    try {
      const data = await client.get<T>(key);
      return data;
    } catch (error) {
      logger.error('Redis get failed', error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis set failed', error);
    }
  },

  async del(key: string): Promise<void> {
    const client = getRedis();
    if (!client) return;
    try {
      await client.del(key);
    } catch (error) {
      logger.error('Redis del failed', error);
    }
  },

  TTL,
};
