import { Db, MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI не задан в переменных окружения");
}
const MONGODB_URI = uri;

const options: MongoClientOptions = {};

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!client) {
    client = new MongoClient(MONGODB_URI, options);
    await client.connect();
  }
  db = client.db();
  return db;
}

