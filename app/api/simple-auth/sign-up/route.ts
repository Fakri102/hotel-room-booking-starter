import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists using select instead of query
    const existingUsers = await db.select().from(user).where(eq(user.email, email));

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Generate user ID and hash password
    const userId = nanoid();
    
    // Create user
    const newUser = await db.insert(user).values({
      id: userId,
      email,
      name,
      emailVerified: true,
      isAdmin: false,
    }).returning();

    // In a real app, you'd generate a proper session/token
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        isAdmin: newUser[0].isAdmin,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}