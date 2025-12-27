import { RedisClient } from "bun";

export const createRedis = (url: string): RedisClient => {
  return new RedisClient(url);
};

export const createSubscriber = async (redis: RedisClient): Promise<RedisClient> => {
  return redis.duplicate();
};
