import { Db, MongoClient, MongoClientOptions } from "mongodb";

const options: MongoClientOptions = {};

let client: MongoClient | null = null;
let db: Db | null = null;
let cachedUri: string | null = null;

const getUri = () => {
  if (cachedUri) return cachedUri;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI не задан в переменных окружения");
  }
  cachedUri = uri;
  return cachedUri;
};

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!client) {
    const uri = getUri();
    client = new MongoClient(uri, options);
    await client.connect();
  }
  db = client.db();
  return db;
}

