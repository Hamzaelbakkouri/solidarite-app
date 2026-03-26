import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Activity } from "@/lib/types";
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

    const activities = await getCollection<Activity>("activities");
    const results = await activities
      .find({ userId: new ObjectId(user._id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ activities: results });
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
