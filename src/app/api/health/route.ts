import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const hasUri = !!process.env.MONGODB_URI;
  const uriPrefix = process.env.MONGODB_URI?.substring(0, 20) + "...";

  try {
    const client = await clientPromise;
    const db = client.db();
    await db.command({ ping: 1 });
    return NextResponse.json({
      status: "ok",
      db: "connected",
      hasUri,
      uriPrefix,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        hasUri,
        uriPrefix,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
