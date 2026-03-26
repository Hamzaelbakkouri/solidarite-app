import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Message, Request } from "@/lib/types";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");

    if (!requestId) {
      return NextResponse.json(
        { error: "Missing required parameter: requestId" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const requests = await getCollection<Request>("requests");
    const reqDoc = await requests.findOne({ _id: new ObjectId(requestId) });

    if (!reqDoc) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const userId = new ObjectId(user._id);
    const isParticipant =
      user.role === "admin" ||
      reqDoc.agentId.equals(userId) ||
      reqDoc.giverId.equals(userId);

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not authorized to view these messages" },
        { status: 403 }
      );
    }

    const messages = await getCollection<Message>("messages");
    const results = await messages
      .find({ requestId: new ObjectId(requestId) })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(results);
  } catch (error) {
    console.error("Get messages error:", error);
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

    const { requestId, content } = await request.json();

    if (!requestId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: requestId, content" },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const requests = await getCollection<Request>("requests");
    const reqDoc = await requests.findOne({ _id: new ObjectId(requestId) });

    if (!reqDoc) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const userId = new ObjectId(user._id);
    const isParticipant =
      reqDoc.agentId.equals(userId) || reqDoc.giverId.equals(userId);

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Not authorized to send messages in this request" },
        { status: 403 }
      );
    }

    const now = new Date();

    const messageData: Record<string, unknown> = {
      requestId: new ObjectId(requestId),
      senderId: userId,
      senderName: user.name,
      senderRole: user.role,
      content,
      createdAt: now,
    };

    const messages = await getCollection<Message>("messages");
    const result = await messages.insertOne(messageData as unknown as Message);

    return NextResponse.json(
      { ...messageData, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
