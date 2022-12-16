import { createClient, RedisClientType } from "redis";

const REDIS_URL = "redis://redis:6379";

export interface RedisClient {
  subscriber: RedisClientType;
  publisher: RedisClientType;
}

export let redisClient: RedisClient = {
  subscriber: createClient({
    url: REDIS_URL,
  }),
  publisher: createClient({
    url: REDIS_URL,
  }),
};

export const initializeRedis = async () => {
  console.log("Initializing redis connections.");

  await Promise.all([
    redisClient.publisher.connect(),
    redisClient.subscriber.connect(),
  ]);

  console.log("Redis connections initialized.");
};
