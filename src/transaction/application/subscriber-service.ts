import { RedisTopics, TopicProcessor } from "../../redis";
import {
  RedisSubscriberService,
  RedisSubscriberServiceInterface,
} from "../../redis/redis-subscriber-service";
import { TransactionService } from "./transaction-service";

let redisSubscriber: RedisSubscriberServiceInterface;
let transactionService: TopicProcessor;

export const setupRedisTransactionSubscription = () => {
  redisSubscriber = new RedisSubscriberService();
  transactionService = new TransactionService();
  redisSubscriber.addTopicProcessor(RedisTopics.Payments, transactionService);
};
