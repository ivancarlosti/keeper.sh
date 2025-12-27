import { log } from "@keeper.sh/log";
import {
  socketMessageSchema,
  broadcastMessageSchema,
  type BroadcastMessage,
} from "@keeper.sh/data-schemas";
import { createSubscriber } from "@keeper.sh/redis";
import { connections, pingIntervals } from "./state";
import type { Socket } from "./types";
import type { RedisClient } from "bun";

export type { BroadcastData, Socket } from "./types";

export type OnConnectCallback = (userId: string, socket: Socket) => void | Promise<void>;

export interface WebsocketHandlerOptions {
  onConnect?: OnConnectCallback;
}

export interface BroadcastConfig {
  redis: RedisClient;
}

export interface BroadcastService {
  emit: (userId: string, event: string, data: unknown) => void;
  startSubscriber: () => Promise<void>;
}

const CHANNEL = "broadcast";

const sendToUser = (userId: string, event: string, data: unknown): void => {
  const userConnections = connections.get(userId);

  if (!userConnections || userConnections.size === 0) {
    return;
  }

  const message = JSON.stringify({ event, data });
  for (const socket of userConnections) {
    socket.send(message);
  }

  log.debug(
    { userId, event, connectionCount: userConnections.size },
    "broadcast sent to sockets",
  );
};

export const createBroadcastService = (config: BroadcastConfig): BroadcastService => {
  const { redis } = config;

  const emit = (userId: string, event: string, data: unknown): void => {
    const message: BroadcastMessage = { userId, event, data };
    redis.publish(CHANNEL, JSON.stringify(message));
    log.debug({ userId, event }, "broadcast published to redis");
  };

  const startSubscriber = async (): Promise<void> => {
    const subscriber = await createSubscriber(redis);

    await subscriber.subscribe(CHANNEL, (message) => {
      const parsed = JSON.parse(message);
      if (!broadcastMessageSchema.allows(parsed)) {
        log.error("invalid broadcast message received from redis");
        return;
      }
      sendToUser(parsed.userId, parsed.event, parsed.data);
    });

    log.info("broadcast subscriber started");
  };

  return { emit, startSubscriber };
};

export const addConnection = (userId: string, socket: Socket): void => {
  const existing = connections.get(userId);
  log.debug({ userId }, "adding connection");

  if (existing) {
    existing.add(socket);
    return;
  }

  connections.set(userId, new Set([socket]));
};

export const removeConnection = (userId: string, socket: Socket): void => {
  const userConnections = connections.get(userId);
  if (userConnections) {
    userConnections.delete(socket);
    if (userConnections.size === 0) {
      connections.delete(userId);
    }
  }
  log.debug({ userId }, "connection removed");
};

export const getConnectionCount = (userId: string): number => {
  return connections.get(userId)?.size ?? 0;
};

const sendPing = (socket: Socket) => {
  socket.send(JSON.stringify({ event: "ping" }));
};

const startPing = (socket: Socket) => {
  sendPing(socket);

  const interval = setInterval(() => {
    if (socket.readyState !== 1) {
      clearInterval(interval);
      return;
    }
    sendPing(socket);
  }, 10_000);

  return interval;
};

export const createWebsocketHandler = (options?: WebsocketHandlerOptions) => ({
  idleTimeout: 60,
  async open(socket: Socket) {
    log.debug({ userId: socket.data.userId }, "socket opened");
    addConnection(socket.data.userId, socket);
    pingIntervals.set(socket, startPing(socket));
    try {
      await options?.onConnect?.(socket.data.userId, socket);
    } catch (error) {
      log.error({ error, userId: socket.data.userId }, "onConnect callback failed");
    }
  },
  close(socket: Socket) {
    const interval = pingIntervals.get(socket);
    if (!interval) return removeConnection(socket.data.userId, socket);
    clearInterval(interval);
    pingIntervals.delete(socket);
  },
  message(socket: Socket, message: string | Buffer) {
    const data = JSON.parse(message.toString());
    if (!socketMessageSchema.allows(data)) {
      log.warn({ userId: socket.data.userId }, "invalid socket message");
      return;
    }

    if (data.event === "pong") {
      return;
    }
  },
});
