import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getCollection } from "@/lib/db";
import { createSession } from "@/lib/auth";
import type { User, UserRole } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, agentDocuments, phone, city, address, birthDate, organization, availability, skills, cin } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, role" },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["giver", "agent", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const users = await getCollection<User>("users");

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");

    const now = new Date();

    const userData: Record<string, unknown> = {
      email,
      password: `${salt}:${hash}`,
      name,
      role,
      createdAt: now,
      updatedAt: now,
    };

    // Common optional fields
    if (phone) userData.phone = phone;
    if (city) userData.city = city;
    if (address) userData.address = address;
    if (birthDate) userData.birthDate = birthDate;

    if (role === "giver") {
      userData.sold = 0;
      userData.donationsCount = 0;
      if (organization) userData.organization = organization;
    }

    if (role === "agent") {
      userData.agentStatus = "pending";
      userData.activeRequests = 0;
      userData.agentDocuments = agentDocuments || [];
      if (cin) userData.cin = cin;
      if (availability) userData.availability = availability;
      if (skills) userData.skills = skills;
    }

    const result = await users.insertOne(userData as unknown as User);

    await createSession(result.insertedId.toString());

    const response = { ...userData, _id: result.insertedId } as Record<string, unknown>;
    delete response.password;

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
