export enum RedisTopics {
  Payments = "payments",
  Transactions = "transactions",
}

const paymentMessages = ["payments-noted"] as const;
type PaymentMessages = typeof paymentMessages[number];
const paymentMessagesString: Record<string, PaymentMessages> = {
  PaymentNoted: "payments-noted",
};

const transactionMessages = ["transactions-paid"] as const;
type TransactionMessages = typeof transactionMessages[number];
const transactionMessagesString: Record<string, TransactionMessages> = {
  TransactionsPaid: "transactions-paid",
};

const allMessages = [...paymentMessages, ...transactionMessages] as const;

export type AllMessageTypes = typeof allMessages[number];

export const TopicMessageTypes = {
  [RedisTopics.Payments]: paymentMessagesString,
  [RedisTopics.Transactions]: transactionMessagesString,
};

export interface RedisMessageType<T> {
  messageType: AllMessageTypes;
  body: T;
}

export interface TopicProcessor {
  processMessage(message: RedisMessageType<any>): Promise<void>;
}
