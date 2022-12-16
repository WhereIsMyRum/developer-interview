import { connectToDb } from "./database/database";
import express from "express";
import bodyParser from "body-parser";
import { initializeRedis } from "./redis";
import { setupRedisTransactionSubscription } from "./transaction/application/subscriber-service";
import { setupRedisPaymentNoteSubscription } from "./payment-note/application/subscriber-service";

const main = async () => {
  await connectToDb();
  await initializeRedis();

  const app = express();
  const { router: paymentNoteRouter } = require("./payment-note");

  setupRedisTransactionSubscription();
  setupRedisPaymentNoteSubscription();

  app.use(bodyParser.json());
  app.use(paymentNoteRouter);
  app.listen(3000);
};

export default main;
