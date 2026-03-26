import { Document } from "mongodb";
import clientPromise from "./mongodb";

const DB_NAME = "solidarite";

export async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export async function getCollection<T extends Document = {}>(name: string) {
  const db = await getDb();
  return db.collection<T>(name);
}
