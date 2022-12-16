import { TransactionDto } from "../../../transaction/application/dtos/transaction.dto";

export class PaymentNoteDto {
  uuid!: string;
  periodFrom!: string;
  periodTo!: string;
  periodCreated!: string;
  transactionsCount!: number;
  value!: number;
  statusCode!: string;
}

export class PaymentNoteWithTransactionsDto extends PaymentNoteDto {
  transactions: TransactionDto[] = [];
}
