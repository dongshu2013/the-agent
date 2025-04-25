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
    // TODO 
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

    // TODO Check user credit


    // Parse request body
    const body = await req.json();
    const { chats } = body;

    if (!chats || !Array.isArray(chats) || chats.length === 0) {
      return NextResponse.json(
        { error: "No chats provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("---import chats:", chats);

    // Batch upsert to tg_chats
    const upsertResults = await Promise.all(
      chats.map(async (chat) => {
        try {
          return await prisma.tg_chats.upsert({
            where: {
              user_id_chat_id: {
                user_id: userId,
                chat_id: chat.chat_id,
              },
            },
            update: {
              chat_type: chat.chat_type,
              chat_title: chat.chat_title,
              is_public: chat.is_public || false,
              is_free: chat.is_free || false,
              subscription_fee: chat.subscription_fee || 0,
              last_synced_at: new Date(),
              status: chat.status || 'watching',
              updated_at: new Date(),
            },
            create: {
              user_id: userId,
              chat_id: chat.chat_id,
              chat_type: chat.chat_type,
              chat_title: chat.chat_title,
              is_public: chat.is_public || false,
              is_free: chat.is_free || false,
              subscription_fee: chat.subscription_fee || 0,
              last_synced_at: new Date(),
              status: chat.status || 'watching',
            },
          });
        } catch (err) {
          console.error(`Error upserting chat ${chat.chat_id}:`, err);
          return { error: err, chat_id: chat.chat_id };
        }
      })
    );

    // Filter out successful and failed operations
    const successfulUpserts = upsertResults.filter(result => !('error' in result));
    const failedUpserts = upsertResults.filter(result => 'error' in result);

    return NextResponse.json(
      { 
        success: true, 
        message: `Successfully processed ${successfulUpserts.length} chats`,
        total: chats.length,
        successful: successfulUpserts.length,
        failed: failedUpserts.length,
        failedDetails: failedUpserts.map(f => ({ chat_id: f.chat_id }))
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error importing chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}