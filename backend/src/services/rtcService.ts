import { createHash } from "node:crypto";
import tokenGenerator from "@dingrtc/token-generator";
import { config } from "../config/env.js";

type ProduceFn = (params: {
  appId: string;
  appKey: string;
  channelId: string;
  userId: string;
}) => string;
import * as rtcRepo from "../repositories/rtcRepository.js";
import type { RtcSessionRow } from "../repositories/rtcRepository.js";
import { notifyUser } from "./realtimeHub.js";
import type { CacheAdapter } from "../types/fastify.js";

const produceAppToken = tokenGenerator.produce as unknown as ProduceFn;

const MAX_TTL_SECONDS = 24 * 60 * 60;

export class ServiceError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

function assertRtcEnabled(): void {
  if (!config.rtc.enabled) throw new ServiceError("RTC 功能未启用", 503);
  if (!config.rtc.appId || !config.rtc.appKey) {
    throw new ServiceError("RTC 未配置 AppID/AppKey，请在环境变量中设置", 503);
  }
}

export function toRtcUserId(userId: number): string {
  return `u${userId}`;
}

export function generateRtcToken(params: { channelId: string; userId: number }) {
  const appId = config.rtc.appId;
  const appKey = config.rtc.appKey;
  const rtcUserId = toRtcUserId(params.userId);
  const token = produceAppToken(appId, appKey, params.channelId, rtcUserId);
  const ttl = Math.min(Math.max(config.rtc.tokenTtlSeconds, 60), MAX_TTL_SECONDS);

  return {
    appId,
    channel: params.channelId,
    uid: rtcUserId,
    token,
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
  };
}

export function generateLegacySha256Token(params: {
  channelId: string;
  userId: number;
  nonce: string;
  timestamp: number;
}) {
  const rtcUserId = toRtcUserId(params.userId);
  const token = createHash("sha256")
    .update(
      `${config.rtc.appId}${config.rtc.appKey}${params.channelId}${rtcUserId}${params.nonce}${params.timestamp}`,
    )
    .digest("hex");
  return {
    appId: config.rtc.appId,
    channel: params.channelId,
    uid: rtcUserId,
    nonce: params.nonce,
    timestamp: params.timestamp,
    token,
  };
}

export interface FormattedSession {
  id: number;
  channelId: string;
  creatorId: number;
  calleeId: number;
  orderId: number | null;
  status: string;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  creatorAccount?: string;
  calleeAccount?: string;
}

function formatSession(row: RtcSessionRow | null): FormattedSession | null {
  if (!row) return null;
  return {
    id: row.id,
    channelId: row.channel_id,
    creatorId: row.creator_id,
    calleeId: row.callee_id,
    orderId: row.order_id,
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
    creatorAccount: row.creator_account,
    calleeAccount: row.callee_account,
  };
}

function isParticipant(session: RtcSessionRow, userId: number): boolean {
  return session.creator_id === userId || session.callee_id === userId;
}

export async function createSession(
  creatorId: number,
  body: { calleeId: number; orderId?: number | null },
  opts: { cache?: CacheAdapter } = {},
): Promise<FormattedSession> {
  assertRtcEnabled();

  if (!body.calleeId || body.calleeId === creatorId) {
    throw new ServiceError("不能呼叫自己", 400);
  }

  const callee = await rtcRepo.findUserById(body.calleeId);
  if (!callee || callee.status !== "active") {
    throw new ServiceError("被叫用户不存在或不可用", 400);
  }

  const session = await rtcRepo.createSession({
    creatorId,
    calleeId: body.calleeId,
    orderId: body.orderId,
  });

  const formatted = formatSession(session)!;

  if (opts.cache) {
    await opts.cache.set(`rtc:incoming:${body.calleeId}`, formatted, 120);
  }

  notifyUser(body.calleeId, { type: "rtc.incoming", session: formatted });
  return formatted;
}

export async function listIncomingCalls(userId: number): Promise<FormattedSession[]> {
  assertRtcEnabled();
  return (await rtcRepo.listIncomingAsCallee(userId)).map((r) => formatSession(r)!);
}

export async function getSession(channelId: string, userId: number): Promise<FormattedSession> {
  assertRtcEnabled();
  const session = await rtcRepo.findByChannelId(channelId);
  if (!session) throw new ServiceError("会话不存在", 404);
  if (!isParticipant(session, userId)) throw new ServiceError("无权访问此会话", 403);
  return formatSession(session)!;
}

export async function joinSession(
  channelId: string,
  userId: number,
  opts: { cache?: CacheAdapter } = {},
) {
  assertRtcEnabled();
  const session = await rtcRepo.findByChannelId(channelId);
  if (!session) throw new ServiceError("会话不存在", 404);
  if (session.status === "ended" || session.status === "cancelled") {
    throw new ServiceError("会话已结束", 400);
  }
  if (!isParticipant(session, userId)) {
    throw new ServiceError("您不是此会话的参与者", 403);
  }

  const cacheKey = `rtc:token:${channelId}:${userId}`;
  if (opts.cache) {
    const cached = await opts.cache.get<Record<string, unknown>>(cacheKey);
    if (cached) return cached;
  }

  const user = await rtcRepo.findUserById(userId);
  const credentials = generateRtcToken({ channelId, userId });
  const joinInfo = {
    ...credentials,
    userName: user?.account || user?.phone || credentials.uid,
    session: formatSession(session),
  };

  if (opts.cache) {
    const ttl = Math.min(config.rtc.tokenTtlSeconds, MAX_TTL_SECONDS - 60);
    await opts.cache.set(cacheKey, joinInfo, ttl);
  }

  await rtcRepo.markActive(channelId);
  return joinInfo;
}

export async function endSession(channelId: string, userId: number): Promise<FormattedSession> {
  assertRtcEnabled();
  const session = await rtcRepo.findByChannelId(channelId);
  if (!session) throw new ServiceError("会话不存在", 404);
  if (!isParticipant(session, userId)) throw new ServiceError("无权结束此会话", 403);

  await rtcRepo.markEnded(channelId);
  const ended = formatSession(await rtcRepo.findByChannelId(channelId))!;
  const peerUserId = ended.creatorId === userId ? ended.calleeId : ended.creatorId;
  notifyUser(peerUserId, { type: "rtc.ended", session: ended });
  return ended;
}

export async function listMySessions(
  userId: number,
  query: { limit?: string; offset?: string } = {},
): Promise<FormattedSession[]> {
  assertRtcEnabled();
  const limit = Math.min(parseInt(query.limit || "20", 10), 50);
  const offset = parseInt(query.offset || "0", 10);
  return (await rtcRepo.listForUser(userId, { limit, offset })).map((r) => formatSession(r)!);
}
