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

    const userId = user.id;
    console.log("---User found:", user);


    // Parse request body
    const body = await req.json();
    const { messages } = body;

    if (
      !messages ||
      !Array.isArray(messages) ||
      messages.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid messages data" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("---Messages received:", messages.length);

    // Get unique Telegram chat IDs from the messages
    const uniqueTelegramChatIds = Array.from(new Set(messages.map(msg => msg.chat_id)));
    
    // Fetch all relevant chat records to get the mapping from Telegram chat_id to internal UUID
    const chatRecords = await prisma.tg_chats.findMany({
      where: {
        chat_id: { in: uniqueTelegramChatIds },
        user_id: userId
      },
      select: {
        id: true,
        chat_id: true
      }
    });

    // Create a mapping from Telegram chat_id to internal UUID
    const chatIdMapping = new Map();
    chatRecords.forEach(chat => {
      chatIdMapping.set(chat.chat_id, chat.id);
    });

    console.log("---Chat ID mapping:", Object.fromEntries(chatIdMapping));

    // Filter out messages for chats that don't exist in our database
    const validMessages = messages.filter(msg => chatIdMapping.has(msg.chat_id));
    
    if (validMessages.length === 0) {
      return NextResponse.json({
        code: 400,
        message: "No valid messages found. Ensure the chats exist in the database first.",
        data: {
          total_message_count: messages.length,
          synced_message_count: 0
        }
      }, { headers: corsHeaders });
    }

    // Format messages according to the database schema
    const formattedMessages = validMessages.map(msg => ({
      chat_id: chatIdMapping.get(msg.chat_id), // Use the internal UUID
      message_id: msg.message_id,
      message_text: msg.message_text || '',
      message_timestamp: BigInt(msg.message_timestamp),
      sender_id: msg.sender_id || null,
      sender_username: msg.sender?.username || null,
      sender_firstname: msg.sender?.firstName || null,
      sender_lastname: msg.sender?.lastName || null,
      reply_to_msg_id: msg.replyTo?.messageId || null,
      is_pinned: msg.is_pinned || false
    }));

    // Use Prisma's createMany with skipDuplicates to handle upserts efficiently
    const result = await prisma.tg_messages.createMany({
      data: formattedMessages,
      skipDuplicates: true, // Skip records that would violate the unique constraint
    });

    // Update the last_synced_at for all affected chats
    if (formattedMessages.length > 0) {
      await prisma.tg_chats.updateMany({
        where: {
          id: { in: Array.from(chatIdMapping.values()) }
        },
        data: { last_synced_at: new Date() }
      });
    }

    // Return success response
    return NextResponse.json({
      code: 200,
      message: `Successfully imported ${result.count} messages`,
      data: {
        total_message_count: messages.length,
        synced_message_count: result.count
      }
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Failed to batch insert messages:", error);
    return NextResponse.json(
      {
        code: 500,
        message: "Failed to process messages",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}