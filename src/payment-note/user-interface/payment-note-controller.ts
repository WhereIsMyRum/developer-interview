import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import {
  PaymentNoteService,
  PaymentNoteServiceInterface,
} from "../application/payment-note-service";
import { body, param, validationResult } from "express-validator";
import { CreatePaymentNoteQueryDto } from "../application/query";
import {
  PaymentNoteDto,
  PaymentNoteWithTransactionsDto,
} from "../application/dtos/PaymentNote.dto";
import dayjs from "dayjs";

export interface PaymentNoteControllerInterface {
  createPaymentNote(): any;
}

export class PaymentNoteController implements PaymentNoteControllerInterface {
  private readonly paymentNoteService: PaymentNoteServiceInterface;

  constructor() {
    this.paymentNoteService = new PaymentNoteService();
  }

  createPaymentNote(): any[] {
    return [
      ...this._validateCreatePaymentNote(),
      validationInterceptor,
      this._createPaymentNote.bind(this),
    ];
  }

  retrievePaymentNotes(): any[] {
    return [this._retrievePaymentNotes.bind(this)];
  }

  retrievePaymentNoteByUuid(): any[] {
    return [
      param("uuid", "Not a valid uuid").isUUID(4),
      validationInterceptor,
      this._retrievePaymentNoteByUuid.bind(this),
    ];
  }

  async _retrievePaymentNotes(_req: Request, res: Response): Promise<void> {
    const result: PaymentNoteDto[] = (
      await this.paymentNoteService.retrievePaymentNotes()
    ).map((paymentNote) => {
      const props = paymentNote.getProperties();

      return {
        ...props,
        periodFrom: props.periodFrom.toISOString(),
        periodTo: props.periodFrom.toISOString(),
        periodCreated: props.periodCreated.toISOString(),
      };
    });

    res.send(result);
  }

  async _retrievePaymentNoteByUuid(req: Request, res: Response): Promise<any> {
    const result = await this.paymentNoteService.retrievePaymentNoteByUuid(
      req.params.uuid
    );

    const paymentNoteProperties = result.paymentNote.getProperties();

    const mappedResults: PaymentNoteWithTransactionsDto = {
      ...paymentNoteProperties,
      periodFrom: paymentNoteProperties.periodFrom.toISOString(),
      periodTo: paymentNoteProperties.periodTo.toISOString(),
      periodCreated: paymentNoteProperties.periodCreated.toISOString(),
      transactions: result.transactions.map((transaction) => {
        const props = transaction.getProperties();

        return {
          ...props,
          uuid: props.uuid,
          dateTime: props.dateTime.toISOString(),
        };
      }),
    };

    res.send(mappedResults);
  }

  async _createPaymentNote(
    req: Request<
      ParamsDictionary,
      any,
      CreatePaymentNoteQueryDto,
      ParsedQs,
      Record<string, any>
    >,
    res: Response<any, Record<string, any>>
  ): Promise<void> {
    const body = req.body;

    const paymentNote = await this.paymentNoteService.createPaymentNote(body);

    res.send({ status: 201, uuid: paymentNote.getProperties().uuid });
  }

  private _validateCreatePaymentNote() {
    return [
      body("periodFrom", "Not a valid date").isISO8601(),
      body("periodTo", "Not a valid date").isISO8601(),
    ];
  }
}

const validationInterceptor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(490).json({ errors: errors.array() });
  }

  next();
};
