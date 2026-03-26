import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Request, Post } from "@/lib/types";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const requests = await getCollection<Request>("requests");

    let filter: Record<string, unknown> = {};

    if (user.role === "agent") {
      filter = { agentId: new ObjectId(user._id) };
    } else if (user.role === "giver") {
      filter = { giverId: new ObjectId(user._id) };
    } else if (user.role === "admin") {
      filter = { status: "pending" };
    }

    const results = await requests
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ requests: results });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role !== "agent") {
      return NextResponse.json(
        { error: "Only agents can create requests" },
        { status: 403 }
      );
    }

    if (user.agentStatus !== "verified") {
      return NextResponse.json(
        { error: "Agent must be verified to create requests" },
        { status: 403 }
      );
    }

    // Count pending + approved (in-progress) requests — both count toward the limit of 3
    const requests = await getCollection<Request>("requests");
    const activeCount = await requests.countDocuments({
      agentId: new ObjectId(user._id),
      status: { $in: ["pending", "approved"] },
    });

    if (activeCount >= 3) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas avoir plus de 3 demandes en cours (en attente + approuvées)" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { postId, message } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "Missing required field: postId" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const posts = await getCollection<Post>("posts");
    const post = await posts.findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.status !== "available") {
      return NextResponse.json(
        { error: "Post is not available" },
        { status: 400 }
      );
    }

    const now = new Date();

    const requestData: Record<string, unknown> = {
      postId: new ObjectId(postId),
      postTitle: post.title,
      agentId: new ObjectId(user._id),
      agentName: user.name,
      giverId: post.giverId,
      giverName: post.giverName,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    if (message) {
      requestData.message = message;
    }

    const result = await requests.insertOne(requestData as unknown as Request);

    return NextResponse.json(
      { ...requestData, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
