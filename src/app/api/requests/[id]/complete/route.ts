import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Request, Post, User } from "@/lib/types";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const requests = await getCollection<Request>("requests");
    const reqDoc = await requests.findOne({ _id: new ObjectId(id) });

    if (!reqDoc) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (reqDoc.status !== "approved") {
      return NextResponse.json(
        { error: "Request must be approved before completing" },
        { status: 400 }
      );
    }

    const now = new Date();

    await requests.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "completed", updatedAt: now } }
    );

    const posts = await getCollection<Post>("posts");
    await posts.updateOne(
      { _id: reqDoc.postId },
      { $set: { status: "completed", updatedAt: now } }
    );

    const users = await getCollection<User>("users");

    await users.updateOne(
      { _id: reqDoc.agentId },
      { $inc: { activeRequests: -1 }, $set: { updatedAt: now } }
    );

    await users.updateOne(
      { _id: reqDoc.giverId },
      { $inc: { donationsCount: 1 }, $set: { updatedAt: now } }
    );

    return NextResponse.json({ message: "Request completed", status: "completed" });
  } catch (error) {
    console.error("Complete request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
