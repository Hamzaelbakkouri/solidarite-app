import { MongoClient } from "mongodb";

const options = {};

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let clientPromise: Promise<MongoClient>;

if (typeof process.env.MONGODB_URI === "string" && process.env.MONGODB_URI) {
  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(process.env.MONGODB_URI, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    const client = new MongoClient(process.env.MONGODB_URI, options);
    clientPromise = client.connect();
  }
} else {
  // During build time, provide a placeholder that will throw at runtime
  clientPromise = new Promise(() => {});
}

export default clientPromise;
