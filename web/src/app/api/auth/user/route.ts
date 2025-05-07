import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get("authorization");
    const { isAuthenticated, uid, error } = await authenticateRequest(
      authHeader
    );

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Ensure the user is only accessing their own data
    if (userId !== uid) {
      return NextResponse.json(
        { error: "Unauthorized access to user data" },
        { status: 403 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      apiKey: user.api_key,
      apiKeyEnabled: user.api_key_enabled,
      credits: user.credits,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authHeader = request.headers.get("authorization");
    const { isAuthenticated, uid, error } = await authenticateRequest(
      authHeader
    );

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: error || "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, username, email } = await request.json();

    if (!id || !username) {
      return NextResponse.json(
        { error: "User ID and username are required" },
        { status: 400 }
      );
    }

    // Ensure the user is only creating their own data
    if (id !== uid) {
      return NextResponse.json(
        { error: "Unauthorized user creation" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (existingUser) {
      return NextResponse.json({
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        apiKey: existingUser.api_key,
        apiKeyEnabled: existingUser.api_key_enabled,
        credits: existingUser.credits,
      });
    }

    // Create new user with auto-generated API key
    // No need to specify api_key as it's auto-generated with @default(uuid())
    const newUser = await prisma.users.create({
      data: {
        id,
        username,
        email: email || null,
        // api_key and api_key_enabled will be automatically set by default values
      },
    });

    return NextResponse.json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      apiKey: newUser.api_key,
      apiKeyEnabled: newUser.api_key_enabled,
      credits: newUser.credits,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
