import { RedisTopics, TopicProcessor } from "../../redis";
import {
  RedisSubscriberService,
  RedisSubscriberServiceInterface,
} from "../../redis/redis-subscriber-service";
import { PaymentNoteService } from "./payment-note-service";

let redisSubscriber: RedisSubscriberServiceInterface;
let paymentNoteService: TopicProcessor;

export const setupRedisPaymentNoteSubscription = () => {
  redisSubscriber = new RedisSubscriberService();
  paymentNoteService = new PaymentNoteService();
  redisSubscriber.addTopicProcessor(
    RedisTopics.Transactions,
    paymentNoteService
  );
};
