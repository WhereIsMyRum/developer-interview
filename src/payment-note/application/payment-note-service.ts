import {
  PaymentNote,
  PaymentNoteFactory,
  PaymentNoteFactoryInterface,
  StatusCode,
} from "../domain";
import {
  PaymentNoteRepository,
  PaymentNoteRepositoryInterface,
} from "../repository";
import { CreatePaymentNoteQueryDto } from "./query";
import dayjs from "dayjs";
import {
  TopicMessageTypes,
  RedisTopics,
  TopicProcessor,
  RedisMessageType,
} from "../../redis";
import {
  RedisPublisherService,
  RedisPublisherServiceInterface,
} from "../../redis/redis-publisher-service";
import { PaymentNotedDto } from "../../transaction/application/dtos";
import { TransactionsPaidDto } from "../../transaction/application/dtos/transactionsPaid.dto";
import {
  Transaction,
  TransactionFactory,
  TransactionFactoryInterface,
  StatusCode as TransactionStatusCode,
} from "../../transaction/domain";

export interface PaymentNoteServiceInterface {
  createPaymentNote(query: CreatePaymentNoteQueryDto): Promise<PaymentNote>;
  retrievePaymentNotes(): Promise<PaymentNote[]>;
  retrievePaymentNoteByUuid(
    uuid: string
  ): Promise<{ paymentNote: PaymentNote; transactions: Transaction[] }>;
}

export class PaymentNoteService
  implements PaymentNoteServiceInterface, TopicProcessor
{
  private readonly paymentNoteRepository: PaymentNoteRepositoryInterface;
  private readonly paymentNoteFactory: PaymentNoteFactoryInterface;
  private readonly transactionFactory: TransactionFactoryInterface;
  private readonly redisService: RedisPublisherServiceInterface;

  constructor() {
    this.paymentNoteRepository = new PaymentNoteRepository();
    this.paymentNoteFactory = new PaymentNoteFactory();
    this.transactionFactory = new TransactionFactory();
    this.redisService = new RedisPublisherService();
  }

  async createPaymentNote(
    query: CreatePaymentNoteQueryDto
  ): Promise<PaymentNote> {
    const paymentNote = this.paymentNoteFactory.createPaymentNote({
      periodFrom: dayjs(query.periodFrom),
      periodTo: dayjs(query.periodTo),
    });

    await this.paymentNoteRepository.save(paymentNote);
    await this.publishPaymentNoteCreated(paymentNote);

    return paymentNote;
  }

  async retrievePaymentNotes(): Promise<PaymentNote[]> {
    const results = await this.paymentNoteRepository.getPaymentNotes();

    return results.map((result) =>
      this.paymentNoteFactory.createPaymentNote({
        ...result,
        periodFrom: dayjs(result.periodFrom),
        periodTo: dayjs(result.periodTo),
        periodCreated: dayjs(result.created),
        statusCode: result.statusCode as StatusCode,
      })
    );
  }

  async retrievePaymentNoteByUuid(
    uuid: string
  ): Promise<{ paymentNote: PaymentNote; transactions: Transaction[] }> {
    const results = await this.paymentNoteRepository.getPaymentNoteByUuid(uuid);

    const paymentNote = this.paymentNoteFactory.createPaymentNote({
      ...results[0],
      periodFrom: dayjs(results[0].periodFrom),
      periodTo: dayjs(results[0].periodTo),
      periodCreated: dayjs(results[0].created),
      statusCode: results[0].statusCode as StatusCode,
    });

    const transactions = results
      .filter((transaction) => transaction.transactionUuid !== null)
      .map((transaction) =>
        this.transactionFactory.createTransaction({
          uuid: transaction.transactionUuid,
          statusCode: transaction.transactionDatetime as TransactionStatusCode,
          value: transaction.transactionValue,
          dateTime: dayjs(transaction.transactionDatetime),
          paymentNoteUuid: results[0].uuid,
        })
      );

    return { paymentNote, transactions };
  }

  async processMessage(message: RedisMessageType<any>): Promise<void> {
    switch (message.messageType) {
      case TopicMessageTypes[RedisTopics.Transactions].TransactionsPaid: {
        return this.processTransactionPaid(
          message as RedisMessageType<TransactionsPaidDto>
        );
      }
      default: {
        throw new Error(
          `Message type not supported by ${PaymentNoteService.name}`
        );
      }
    }
  }

  private async processTransactionPaid(
    message: RedisMessageType<TransactionsPaidDto>
  ) {
    const {
      body: { paymentNoteUuid, count, value },
    } = message;

    await this.paymentNoteRepository.updatePaymentNoteCountAndValue(
      paymentNoteUuid,
      {
        count,
        value,
      }
    );
  }

  private async publishPaymentNoteCreated(
    paymentNote: PaymentNote
  ): Promise<void> {
    const props = paymentNote.getProperties();

    console.log("Publishing payment note created message.");

    const result = await this.redisService.publishMessage<PaymentNotedDto>(
      RedisTopics.Payments,
      TopicMessageTypes[RedisTopics.Payments].PaymentNoted,
      {
        uuid: paymentNote.getProperties().uuid,
        periodFromDateTime: props.periodFrom.toISOString(),
        periodToDateTime: props.periodTo.toISOString(),
      }
    );

    if (result === 0) {
      console.log(`Error publishing to topic ${RedisTopics.Payments}`);
    }
  }
}
