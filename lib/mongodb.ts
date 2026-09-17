import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";
const dbName = process.env.MONGODB_DB ?? "lifeos";

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(uri);
}

function getClient(): Promise<MongoClient> | null {
  if (!uri) return null;
  if (clientPromise) return clientPromise;
  client = new MongoClient(uri);
  clientPromise = client.connect();
  return clientPromise;
}

export async function getDb(): Promise<Db | null> {
  const promise = getClient();
  if (!promise) return null;
  const c = await promise;
  return c.db(dbName);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  const promise = getClient();
  if (!promise) return null;
  return promise;
}
