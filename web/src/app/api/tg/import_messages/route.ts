import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, api_key",
};

interface MessageData {
  message_id: string;
  channel_id: string;
  chat_id: string;
  message_text: string;
  message_timestamp: number;
  sender_id?: string;
  sender?: any;
  reply_to?: string;
  topic_id?: string;
  buttons?: any[];
  reactions?: any[];
  is_pinned?: boolean;
  media_type?: string;
  media_file_id?: string;
  media_url?: string;
  media_metadata?: any;
  send_username?: string;
  send_firstname?: string;
  send_lastname?: string;
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

    console.log("---User found:", user);

    // Parse request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("---Messages received:", messages.length);

    // Initialize counters
    let totalCount = messages.length;
    let successCount = 0;
    let failedCount = 0;

    // Process each message
    for (const message of messages) {
      try {
        // Validate required fields
        if (!message.message_id || !message.message_text || !message.data_type || !message.data_id) {
          console.error("Missing required fields in message:", message);
          failedCount++;
          continue;
        }

        // Format channel_id
        const channelId = `${user.id}:${message.data_type}:${message.data_id}`;
        
        // Check if channel exists
        const channel = await prisma.tg_channels.findUnique({
          where: {
            channel_id: channelId,
          },
        });

        if (!channel) {
          console.error("Channel not found:", channelId);
          failedCount++;
          continue;
        }

        // Prepare message data for upsert operation
        const messageData: MessageData = {
          message_id: message.message_id,
          channel_id: channelId,
          chat_id: message.data_id,
          message_text: message.message_text,
          message_timestamp: message.message_timestamp || Math.floor(Date.now() / 1000),
          sender_id: message.sender_id,
          sender: message.sender || {},
          reply_to: message.reply_to,
          topic_id: message.topic_id,
          buttons: message.buttons || [],
          reactions: message.reactions || [],
          is_pinned: message.is_pinned !== undefined ? message.is_pinned : false,
          media_type: message.media_type,
          media_file_id: message.media_file_id,
          media_url: message.media_url,
          media_metadata: message.media_metadata || {},
          send_username: message.send_username,
          send_firstname: message.send_firstname,
          send_lastname: message.send_lastname,
        };

        // Upsert message data
        await prisma.tg_messages.upsert({
          where: {
            channel_id_message_id: {
              channel_id: channelId,
              message_id: message.message_id,
            },
          },
          update: {
            ...messageData,
            updated_at: new Date(),
          },
          create: {
            ...messageData,
          },
        });

        successCount++;
      } catch (error) {
        console.error("Error processing message:", error);
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
    console.error("Error in import_messages API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}