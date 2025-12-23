import { redis } from "@keeper.sh/redis";
import { log } from "@keeper.sh/log";

const SYNC_KEY_PREFIX = "sync:generation:";
const SYNC_TTL_SECONDS = 86400;

const getSyncKey = (userId: string): string => `${SYNC_KEY_PREFIX}${userId}`;

export interface SyncContext {
  userId: string;
  generation: number;
}

export const startSync = async (userId: string): Promise<SyncContext> => {
  const key = getSyncKey(userId);
  const generation = await redis.incr(key);
  await redis.expire(key, SYNC_TTL_SECONDS);

  log.debug({ userId, generation }, "starting sync generation");

  return { userId, generation };
};

export const isSyncCurrent = async (context: SyncContext): Promise<boolean> => {
  const key = getSyncKey(context.userId);
  const currentGeneration = await redis.get(key);

  if (currentGeneration === null) {
    return false;
  }

  return parseInt(currentGeneration, 10) === context.generation;
};

export const endSync = async (context: SyncContext): Promise<void> => {
  log.debug({ userId: context.userId, generation: context.generation }, "ending sync generation");
};
