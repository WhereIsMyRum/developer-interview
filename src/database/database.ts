import mysql2, { Connection } from "mysql2/promise";

export let db: Connection;

const dbConfig = {
  host: "db",
  user: "root",
  port: 3306,
  password: "password",
  database: "transactions",
};

const initializeDb = async (): Promise<Connection> => {
  console.log("Initializing database connection.");
  db = await mysql2.createConnection(dbConfig);

  console.log("Database connection initialized.");
  return db;
};

export const connectToDb = () => {
  if (db !== undefined) {
    return db;
  }

  return initializeDb();
};
