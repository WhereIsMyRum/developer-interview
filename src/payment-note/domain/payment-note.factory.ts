import { PaymentNote, PaymentNoteProperties, StatusCode } from "./payment-note";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

type PaymentNoteFactoryProperties = Pick<
  PaymentNoteProperties,
  "periodFrom" | "periodTo"
> &
  Partial<
    Omit<
      PaymentNoteProperties,
      "periodFrom" | "periodTo"
    >
  >;

export interface PaymentNoteFactoryInterface {
  createPaymentNote(props: PaymentNoteFactoryProperties): PaymentNote;
}

export class PaymentNoteFactory implements PaymentNoteFactoryInterface {
  createPaymentNote(props: PaymentNoteFactoryProperties): PaymentNote {
    return new PaymentNote(
      props.uuid ?? uuid(),
      props.periodFrom,
      props.periodTo,
      props.periodCreated ?? dayjs(),
      props.transactionsCount ?? 0,
      props.value ?? 0,
      props.statusCode ?? StatusCode.Creating
    );
  }
}
