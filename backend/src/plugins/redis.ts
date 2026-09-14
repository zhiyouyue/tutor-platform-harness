import fp from "fastify-plugin";
import { connectRedis, createRedisClient, getRedis } from "../infra/redis.js";
import { config } from "../config/env.js";
import type { CacheAdapter } from "../types/fastify.js";

const noopCache: CacheAdapter = {
  get: async () => null,
  set: async () => {},
  del: async () => {},
};

export default fp(async (fastify) => {
  if (!config.redis.enabled) {
    fastify.decorate("redis", null);
    fastify.decorate("cache", noopCache);
    return;
  }

  createRedisClient();
  const result = await connectRedis();

  if (!result.ok) {
    fastify.log.warn(`Redis unavailable: ${result.reason}`);
  } else {
    fastify.log.info("Redis connected");
  }

  const redis = getRedis();
  fastify.decorate("redis", redis);

  const cache: CacheAdapter = {
    async get<T>(key: string): Promise<T | null> {
      if (!redis) return null;
      const val = await redis.get(key);
      return val ? (JSON.parse(val) as T) : null;
    },
    async set(key, value, ttl = 300) {
      if (!redis) return;
      await redis.set(key, JSON.stringify(value), "EX", ttl);
    },
    async del(key) {
      if (!redis) return;
      await redis.del(key);
    },
  };

  fastify.decorate("cache", cache);

  fastify.addHook("onClose", async () => {
    if (redis) await redis.quit();
  });
});
