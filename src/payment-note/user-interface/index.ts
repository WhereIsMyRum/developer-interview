import { Router } from "express";
import { PaymentNoteController } from "./payment-note-controller";

const router = Router();

const controller = new PaymentNoteController();

router.post("/payment-notes", ...controller.createPaymentNote());
router.get("/payment-notes", ...controller.retrievePaymentNotes());
router.get("/payment-notes/:uuid", ...controller.retrievePaymentNoteByUuid());

module.exports = { router };
