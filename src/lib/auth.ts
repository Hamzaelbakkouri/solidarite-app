import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDb } from "./db";
import { User } from "./types";

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return null;

  const db = await getDb();
  const session = await db.collection("sessions").findOne({ sessionId });
  if (!session) return null;

  const user = await db.collection<User>("users").findOne({ _id: new ObjectId(session.userId) });
  return user;
}

export async function createSession(userId: string): Promise<string> {
  const db = await getDb();
  const sessionId = crypto.randomUUID();
  await db.collection("sessions").insertOne({
    sessionId,
    userId,
    createdAt: new Date(),
  });
  const cookieStore = await cookies();
  cookieStore.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return sessionId;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (sessionId) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ sessionId });
    cookieStore.delete("session");
  }
}
