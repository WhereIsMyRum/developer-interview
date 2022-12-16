import { RedisClient, redisClient } from "./redis";

import { RedisTopics, AllMessageTypes, RedisMessageType } from "./types";

export interface RedisPublisherServiceInterface {
  publishMessage<T>(
    topic: RedisTopics,
    messageType: AllMessageTypes,
    messageBody: T
  ): Promise<number>;
}

export class RedisPublisherService implements RedisPublisherServiceInterface {
  private redisClient: RedisClient;
  constructor() {
    this.redisClient = redisClient;
  }

  async publishMessage<T>(
    topic: RedisTopics,
    messageType: AllMessageTypes,
    messageBody: T
  ): Promise<number> {
    const message: RedisMessageType<T> = {
      messageType,
      body: messageBody,
    };

    console.log(topic, JSON.stringify(message));

    const result = this.redisClient.publisher.publish(
      topic,
      JSON.stringify(message)
    );

    this.redisClient.publisher.unsubscribe(topic);

    return result;
  }
}
