import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { User } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (user.role !== "giver") {
      return NextResponse.json(
        { error: "Only givers can update their balance" },
        { status: 403 }
      );
    }

    const { amount } = await request.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const users = await getCollection<User>("users");
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(user._id) },
      {
        $inc: { sold: amount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ sold: result.sold });
  } catch (error) {
    console.error("Balance update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
