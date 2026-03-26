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

    const { action } = await request.json();

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
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

    if (reqDoc.status !== "pending") {
      return NextResponse.json(
        { error: "Request is not pending" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === "approve") {
      await requests.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "approved", updatedAt: now } }
      );

      const posts = await getCollection<Post>("posts");
      const post = await posts.findOne({ _id: reqDoc.postId });

      if (post) {
        await posts.updateOne(
          { _id: post._id },
          { $set: { status: "reserved", updatedAt: now } }
        );

        if (post.type === "money" && post.amount) {
          const users = await getCollection<User>("users");
          await users.updateOne(
            { _id: post.giverId },
            { $inc: { sold: -post.amount }, $set: { updatedAt: now } }
          );
        }
      }

      const users = await getCollection<User>("users");
      await users.updateOne(
        { _id: reqDoc.agentId },
        { $inc: { activeRequests: 1 }, $set: { updatedAt: now } }
      );

      return NextResponse.json({ message: "Request approved", status: "approved" });
    } else {
      await requests.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "rejected", updatedAt: now } }
      );

      return NextResponse.json({ message: "Request rejected", status: "rejected" });
    }
  } catch (error) {
    console.error("Validate request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
