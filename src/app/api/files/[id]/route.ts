import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const db = await getDb();
    const file = await db.collection("files").findOne({ _id: new ObjectId(id) });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Extract raw base64 from data URL
    const base64Data = (file.data as string).split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.mimeType as string,
        "Content-Disposition": `inline; filename="${file.fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
