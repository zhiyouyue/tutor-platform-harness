import type { WebSocket } from "@fastify/websocket";

const userSockets = new Map<number, Set<WebSocket>>();

export function registerSocket(userId: number, socket: WebSocket): void {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId)!.add(socket);
}

export function unregisterSocket(userId: number, socket: WebSocket): void {
  const set = userSockets.get(userId);
  if (!set) return;
  set.delete(socket);
  if (set.size === 0) userSockets.delete(userId);
}

export function notifyUser(userId: number, payload: unknown): number {
  const set = userSockets.get(userId);
  if (!set || set.size === 0) return 0;

  const message = JSON.stringify(payload);
  let sent = 0;
  for (const socket of set) {
    if (socket.readyState === 1) {
      socket.send(message);
      sent += 1;
    }
  }
  return sent;
}
