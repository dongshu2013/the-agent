import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, api_key",
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    // Extract and validate API key from header
    const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Find user by API key
    const user = await prisma.users.findUnique({
      where: {
        api_key: apiKey,
        api_key_enabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or disabled API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get the count of channels for this user
    const channelsCount = await prisma.tg_chats.count({
      where: {
        user_id: user.id,
      },
    });

    // Get the count of messages for this user's channels
    const messagesCount = await prisma.tg_messages.count({
      where: {
        chat: {
          user_id: user.id,
        },
      },
    });

    // Return the counts
    return NextResponse.json(
      {
        channels_count: channelsCount,
        messages_count: messagesCount,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in Telegram stats API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
