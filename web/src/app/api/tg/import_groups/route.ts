import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, api_key",
};

interface ChatData {
  channel_id: string;
  data_type: string;
  data_id: string;
  metadata?: any;
  is_public?: boolean;
  is_free?: boolean;
  subscription_fee?: number;
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    // Extract and validate API key from header
    const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");

    console.log("---API key:", apiKey);

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
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

    console.log("---User found:", user);

    // Parse request body
    const body = await req.json();
    const { chats } = body;

    if (!chats || !Array.isArray(chats)) {
      return NextResponse.json(
        { error: "Invalid request: chats array is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("---Chats received:", chats);

    // Initialize counters
    let totalCount = chats.length;
    let successCount = 0;
    let failedCount = 0;

    // Process each chat
    for (const chat of chats) {
      try {
        // Validate required fields
        if (!chat.data_type || !chat.data_id) {
          failedCount++;
          continue;
        }

        // Format channel_id
        const channelId = `${user.id}:${chat.data_type}:${chat.data_id}`;

        // Prepare data for upsert operation
        const channelData: ChatData = {
          channel_id: channelId,
          data_type: chat.data_type,
          data_id: chat.data_id,
          metadata: chat.metadata || {},
          is_public: chat.is_public !== undefined ? chat.is_public : false,
          is_free: chat.is_free !== undefined ? chat.is_free : false,
          subscription_fee: chat.subscription_fee !== undefined ? chat.subscription_fee : 0,
        };

        // Upsert channel data
        await prisma.tg_channels.upsert({
          where: {
            channel_id: channelId,
          },
          update: {
            ...channelData,
            user_id: user.id,
            updated_at: new Date(),
          },
          create: {
            ...channelData,
            user_id: user.id,
          },
        });

        successCount++;
      } catch (error) {
        console.error("Error processing chat:", error);
        failedCount++;
      }
    }

    // Return response with counts
    return NextResponse.json(
      {
        total_count: totalCount,
        success_count: successCount,
        failed_count: failedCount,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in import_groups API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}