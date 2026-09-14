import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Redis } from "ioredis";
import "@fastify/jwt";

export interface JwtUser {
  userId: number;
  role: string;
  account?: string;
}

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: JwtUser;
    user: JwtUser;
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      roles: string | string[],
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    redis: Redis | null;
    cache: CacheAdapter;
  }
}
