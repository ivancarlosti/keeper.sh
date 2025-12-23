import { RedisClient } from "bun";
import env from "@keeper.sh/env/redis";

export const redis = new RedisClient(env.REDIS_URL);

export const createSubscriber = () => redis.duplicate();
