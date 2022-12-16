export class PaymentNoteModel {
  uuid!: string;
  periodFrom!: string;
  periodTo!: string;
  created!: string;
  transactionsCount!: number;
  value!: number;
  statusCode!: string;
}

export class PaymentNoteWithTransactionModel {
  uuid!: string;
  periodFrom!: string;
  periodTo!: string;
  created!: string;
  transactionsCount!: number;
  value!: number;
  statusCode!: string;
  transactionUuid!: string;
  transactionStatusCode!: string;
  transactionValue!: number;
  transactionDatetime!: string;
}
