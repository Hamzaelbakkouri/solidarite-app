import { MongoClient } from "mongodb";
import crypto from "crypto";

const uri = process.env.MONGODB_URI!;
const DB_NAME = "solidarite";

const ADMIN_EMAIL = "admin@solidarite.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Administrateur";

async function seed() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB_NAME);
  const users = db.collection("users");

  const existing = await users.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin account already exists.");
    await client.close();
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(ADMIN_PASSWORD, salt, 100000, 64, "sha512").toString("hex");

  await users.insertOne({
    email: ADMIN_EMAIL,
    password: `${salt}:${hash}`,
    name: ADMIN_NAME,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin account created:");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await client.close();
}

seed().catch(console.error);
