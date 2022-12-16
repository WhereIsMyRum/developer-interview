import { PaymentNote } from "../domain/payment-note";
import { db } from "../../database";
import { Connection, OkPacket } from "mysql2/promise";
import { formatDateToSql } from "../../utils";
import {
  PaymentNoteModel,
  PaymentNoteWithTransactionModel,
} from "./models/payment-note.model";

export interface PaymentNoteRepositoryInterface {
  save(paymentNote: PaymentNote): Promise<void>;
  getPaymentNotes(): Promise<PaymentNoteModel[]>;
  getPaymentNoteByUuid(
    uuid: string
  ): Promise<PaymentNoteWithTransactionModel[]>;
  updatePaymentNoteCountAndValue(
    paymentNoteUuid: string,
    data: { count: number; value: number }
  ): Promise<void>;
}

export class PaymentNoteRepository implements PaymentNoteRepositoryInterface {
  private readonly db: Connection;

  constructor(connection?: Connection) {
    if (connection === undefined && db === undefined) {
      throw new Error("Database connection was not initialized.");
    }

    this.db = connection ?? db;
  }

  async save(paymentNote: PaymentNote): Promise<void> {
    const properties = paymentNote.getProperties();

    await this.db.query(
      `INSERT INTO payment_note (
        payment_note_uuid, 
        payment_note_period_from_datetime,
        payment_note_period_to_datetime,
        payment_note_period_created_datetime,
        payment_note_transactions_count,
        payment_note_value,
        payment_note_status_code
      )
      VALUES (?, ?, ?, ?, ?, ?, ?);
      `,
      [
        properties.uuid,
        formatDateToSql(properties.periodFrom),
        formatDateToSql(properties.periodTo),
        formatDateToSql(properties.periodCreated),
        properties.transactionsCount,
        properties.value,
        properties.statusCode,
      ]
    );
  }

  async getPaymentNoteByUuid(
    uuid: string
  ): Promise<PaymentNoteWithTransactionModel[]> {
    const [result] = await this.db.query(
      `SELECT
        payment_note.payment_note_uuid as uuid,
        payment_note.payment_note_period_from_datetime as periodFrom,
        payment_note.payment_note_period_to_datetime as periodTo,
        payment_note.payment_note_period_created_datetime as created,
        payment_note.payment_note_transactions_count as transactionsCount,
        payment_note.payment_note_value as value,
        payment_note.payment_note_status_code as statusCode,
        transaction.transaction_uuid as transactionUuid,
        transaction.transaction_status_code as transactionStatusCode,
        transaction.transaction_value as transactionValue,
        transaction.transaction_datetime as transactionDatetime
       FROM payment_note
       LEFT JOIN transaction
       ON payment_note.payment_note_uuid = transaction.transaction_payment_note_uuid
       WHERE payment_note.payment_note_uuid = ?
      `,
      [uuid]
    );

    return result as PaymentNoteWithTransactionModel[];
  }

  async getPaymentNotes(): Promise<PaymentNoteModel[]> {
    const [result] = await this.db.query(
      `SELECT
        payment_note_uuid as uuid,
        payment_note_period_from_datetime as periodFrom,
        payment_note_period_to_datetime as periodTo,
        payment_note_period_created_datetime as created,
        payment_note_transactions_count as transactionsCount,
        payment_note_value as value,
        payment_note_status_code as statusCode
       FROM payment_note
      `
    );

    return result as PaymentNoteModel[];
  }

  async updatePaymentNoteCountAndValue(
    paymentNoteUuid: string,
    data: { count: number; value: number }
  ): Promise<void> {
    console.log(data.count, data.value);
    const [{ changedRows }] = await this.db.execute<OkPacket>(
      `UPDATE payment_note
       SET payment_note_transactions_count = ?, payment_note_value = ?, payment_note_status_code = 'COMPLETED'
       WHERE payment_note_uuid = ?;
      `,
      [data.count, data.value, paymentNoteUuid]
    );

    if (changedRows === 1) {
      console.log(`Payment ${paymentNoteUuid} note updated successfully`);
      return;
    }

    console.log(`Payment ${paymentNoteUuid} note update failed.`);
  }
}
