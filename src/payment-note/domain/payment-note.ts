import { Dayjs } from "dayjs";

export enum StatusCode {
  Creating = "CREATING",
  Completed = "COMPLETED",
}

export interface PaymentNoteProperties {
  uuid: string;
  periodFrom: Dayjs;
  periodTo: Dayjs;
  periodCreated: Dayjs;
  transactionsCount: number;
  value: number;
  statusCode: StatusCode;
}

export class PaymentNote {
  constructor(
    private readonly uuid: string,
    private readonly periodFrom: Dayjs,
    private readonly periodTo: Dayjs,
    private readonly periodCreated: Dayjs,
    private readonly transactionsCount: number,
    private readonly value: number,
    private readonly statusCode: StatusCode
  ) {}

  getProperties(): PaymentNoteProperties {
    return {
      uuid: this.uuid,
      periodFrom: this.periodFrom,
      periodTo: this.periodTo,
      periodCreated: this.periodCreated,
      transactionsCount: this.transactionsCount,
      value: this.value,
      statusCode: this.statusCode,
    };
  }
}
