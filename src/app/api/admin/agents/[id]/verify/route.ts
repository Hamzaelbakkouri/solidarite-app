import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { User } from "@/lib/types";
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
        { error: "Invalid agent ID" },
        { status: 400 }
      );
    }

    const { action } = await request.json();

    if (!action || !["verify", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'verify' or 'reject'" },
        { status: 400 }
      );
    }

    const users = await getCollection<User>("users");
    const agent = await users.findOne({
      _id: new ObjectId(id),
      role: "agent",
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const newStatus = action === "verify" ? "verified" : "rejected";

    await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { agentStatus: newStatus, updatedAt: now } }
    );

    return NextResponse.json({
      message: `Agent ${newStatus}`,
      agentStatus: newStatus,
    });
  } catch (error) {
    console.error("Verify agent error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
