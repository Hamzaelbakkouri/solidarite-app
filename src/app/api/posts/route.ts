import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Post, User } from "@/lib/types";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const posts = await getCollection<Post>("posts");
    const availablePosts = await posts
      .find({ status: "available" })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ posts: availablePosts });
  } catch (error) {
    console.error("Get posts error:", error);
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

    if (user.role !== "giver") {
      return NextResponse.json(
        { error: "Only givers can create posts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, type, amount, images } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Missing required field: type" },
        { status: 400 }
      );
    }

    if (type === "product" && (!title || !description)) {
      return NextResponse.json(
        { error: "Product posts require title and description" },
        { status: 400 }
      );
    }

    if (type === "money") {
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { error: "Money posts require a positive amount" },
          { status: 400 }
        );
      }

      const users = await getCollection<User>("users");
      const giver = await users.findOne({ _id: new ObjectId(user._id) });

      if (!giver || (giver.sold ?? 0) < amount) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }
    }

    const now = new Date();

    const postData: Record<string, unknown> = {
      giverId: new ObjectId(user._id),
      giverName: user.name,
      title,
      description,
      type,
      status: "available",
      createdAt: now,
      updatedAt: now,
    };

    if (type === "money" && amount) {
      postData.amount = amount;
    }

    if (type === "product" && images && Array.isArray(images)) {
      postData.photos = images;
    }

    const posts = await getCollection<Post>("posts");
    const result = await posts.insertOne(postData as unknown as Post);

    return NextResponse.json(
      { ...postData, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
