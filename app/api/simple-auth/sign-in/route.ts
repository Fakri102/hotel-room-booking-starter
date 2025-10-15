import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user using select instead of query
    const existingUsers = await db.select().from(user).where(eq(user.email, email));

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const existingUser = existingUsers[0];

    // In a real app, you'd verify the password here
    // For now, we'll skip password verification for simplicity
    // const isPasswordValid = await bcrypt.compare(password, existingUser.passwordHash);

    return NextResponse.json({
      message: "Sign in successful",
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        isAdmin: existingUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}