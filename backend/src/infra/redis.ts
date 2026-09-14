import { Redis } from "ioredis";
import { config } from "../config/env.js";

let client: Redis | null = null;

export function createRedisClient(): Redis | null {
  if (!config.redis.enabled) return null;

  client = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    keyPrefix: config.redis.keyPrefix,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

  return client;
}

export function getRedis(): Redis | null {
  return client;
}

export async function connectRedis(): Promise<{ ok: boolean; reason?: string }> {
  if (!config.redis.enabled) return { ok: false, reason: "disabled" };
  if (!client) createRedisClient();
  if (!client) return { ok: false, reason: "not_initialized" };

  try {
    await client.connect();
    await client.ping();
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}
