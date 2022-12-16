import { Dayjs } from "dayjs";
import { TransactionsPaidDto } from "../application/dtos/transactionsPaid.dto";
import { db } from "../../database";
import { Connection, OkPacket, RowDataPacket } from "mysql2/promise";
import { formatDateToSql } from "../../utils";

export interface TransactionRepositoryInterface {
  markAsPaidInDateRange(
    paymentUuid: string,
    dateRange: { from: Dayjs; to: Dayjs }
  ): Promise<TransactionsPaidDto | null>;
}

export class TransactionRepository implements TransactionRepositoryInterface {
  private readonly db: Connection;

  constructor(connection?: Connection) {
    if (connection === undefined && db === undefined) {
      throw new Error("Database connection was not initialized.");
    }

    this.db = connection ?? db;
  }

  async markAsPaidInDateRange(
    paymentNoteUuid: string,
    dateRange: { from: Dayjs; to: Dayjs }
  ): Promise<TransactionsPaidDto | null> {
    const { from, to } = dateRange;

    const [{ changedRows }] = await this.db.execute<OkPacket>(
      `
        UPDATE transaction
        SET transaction_status_code = 'PAID', transaction_payment_note_uuid = ?
        WHERE transaction_status_code = 'PENDING' AND transaction_datetime BETWEEN ? and ?;
      `,
      [paymentNoteUuid, formatDateToSql(from), formatDateToSql(to)]
    );

    if (changedRows !== 0) {
      return {
        ...(await this.getCountAndSumByPaymentId(paymentNoteUuid)),
        paymentNoteUuid,
      };
    }

    return null;
  }

  async getCountAndSumByPaymentId(
    paymentUuid: string
  ): Promise<TransactionsPaidDto> {
    const [[result]] = await this.db.query<RowDataPacket[][]>(
      `SELECT 
        COUNT(*) as count,
        SUM(transaction_value) as value
        FROM transaction
        WHERE transaction_payment_note_uuid = ?`,
      [paymentUuid]
    );

    return result as unknown as TransactionsPaidDto;
  }
}
