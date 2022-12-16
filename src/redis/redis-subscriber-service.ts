import { RedisClient, redisClient } from "./redis";

import { RedisTopics, TopicProcessor, RedisMessageType } from "./types";

export interface RedisSubscriberServiceInterface {
  addTopicProcessor<T extends TopicProcessor>(
    topic: RedisTopics,
    topicProcessor: T
  ): void;
}

export class RedisSubscriberService implements RedisSubscriberServiceInterface {
  private readonly redisClient: RedisClient;
  private topicProcessors!: Record<RedisTopics, TopicProcessor[]>;
  private subscribedTopics: RedisTopics[] = [];

  constructor() {
    Object.values(RedisTopics).forEach((topic) => {
      if (!this.topicProcessors) {
        this.topicProcessors = {} as any;
      }

      this.topicProcessors[topic as RedisTopics] = [];
    });
    this.redisClient = redisClient;
  }

  addTopicProcessor<T extends TopicProcessor>(
    topic: RedisTopics,
    topicProcessor: T
  ) {
    if (!this.subscribedTopics.includes(topic)) {
      this.subscribedTopics.push(topic);
      this.redisClient.subscriber.subscribe(topic, (data) =>
        this.processMessage(data, topic)
      );
    }

    this.topicProcessors[topic].push(topicProcessor);
  }

  private async processMessage(data: string, topic: RedisTopics) {
    const jsonData = JSON.parse(data);
    const { messageType }: RedisMessageType<any> = jsonData;

    if (messageType !== undefined) {
      const topicProcessors = this.topicProcessors[topic];

      const result = await Promise.allSettled(
        topicProcessors.map((processor) => processor.processMessage(jsonData))
      );

      result.forEach((result) => {
        if (result.status === "rejected") {
          console.log(
            `Error processing ${messageType} in topic ${topic}.`,
            result.reason
          );
        }
      });

      return;
    }

    console.log("Error processing redis message!");
  }
}
