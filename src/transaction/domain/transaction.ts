import { Dayjs } from "dayjs";

export enum StatusCode {
  Pending = "PENDING",
  Paid = "PAID",
}

export interface TransactionProperties {
  uuid: string;
  statusCode: StatusCode;
  value: number;
  dateTime: Dayjs;
  paymentNoteUuid: string;
}

export class Transaction {
  constructor(
    private readonly uuid: string,
    private readonly statusCode: StatusCode,
    private readonly value: number,
    private readonly dateTime: Dayjs,
    private readonly paymentNoteUuid: string
  ) {}

  getProperties(): TransactionProperties {
    return {
      uuid: this.uuid,
      statusCode: this.statusCode,
      value: this.value,
      dateTime: this.dateTime,
      paymentNoteUuid: this.paymentNoteUuid,
    };
  }
}
