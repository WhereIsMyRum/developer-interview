import dayjs from "dayjs";
import {
  RedisMessageType,
  RedisPublisherService,
  RedisPublisherServiceInterface,
  RedisTopics,
  TopicMessageTypes,
  TopicProcessor,
} from "../../redis";
import {
  TransactionRepository,
  TransactionRepositoryInterface,
} from "../repository/transaction-repository";
import { PaymentNotedDto } from "./dtos";
import { TransactionsPaidDto } from "./dtos/transactionsPaid.dto";

export interface TransactionServiceInterface {
  updateTransactions(data: PaymentNotedDto): Promise<void>;
}

export class TransactionService
  implements TransactionServiceInterface, TopicProcessor
{
  private readonly transactionRepository: TransactionRepositoryInterface;
  private readonly redisService: RedisPublisherServiceInterface;

  constructor() {
    this.transactionRepository = new TransactionRepository();
    this.redisService = new RedisPublisherService();
  }

  async updateTransactions(data: PaymentNotedDto): Promise<void> {
    const result = await this.transactionRepository.markAsPaidInDateRange(
      data.uuid,
      {
        from: dayjs(data.periodFromDateTime),
        to: dayjs(data.periodToDateTime),
      }
    );

    if (result === null) {
      console.log("No transactions were updated, skipping message publishing.");
      return;
    }

    console.log("Publishing transactions updated message.");
    await this.publishTransactionsUpdated(result);
  }

  async processMessage(message: RedisMessageType<any>): Promise<void> {
    switch (message.messageType) {
      case TopicMessageTypes[RedisTopics.Payments].PaymentNoted: {
        return this.processPaymentNoted(
          message as RedisMessageType<PaymentNotedDto>
        );
      }
      default: {
        throw new Error(
          `Message type not supported by ${TransactionService.name}`
        );
      }
    }
  }

  private async processPaymentNoted(
    message: RedisMessageType<PaymentNotedDto>
  ) {
    await this.updateTransactions(message.body);
  }

  private async publishTransactionsUpdated(data: TransactionsPaidDto) {
    const result = await this.redisService.publishMessage<TransactionsPaidDto>(
      RedisTopics.Transactions,
      TopicMessageTypes[RedisTopics.Transactions].TransactionsPaid,
      data
    );

    if (result === 0) {
      console.log(`Error publishing to topic ${RedisTopics.Transactions}`);
    }
  }
}
