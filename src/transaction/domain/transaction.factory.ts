import { Transaction, TransactionProperties } from "./transaction";

export interface TransactionFactoryInterface {
  createTransaction(props: TransactionProperties): Transaction;
}

export class TransactionFactory implements TransactionFactoryInterface {
  createTransaction(props: TransactionProperties): Transaction {
    return new Transaction(
      props.uuid,
      props.statusCode,
      props.value,
      props.dateTime,
      props.paymentNoteUuid
    );
  }
}
