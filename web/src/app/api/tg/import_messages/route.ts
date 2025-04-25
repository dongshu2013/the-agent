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

    const { syncedMessages } = await req.json();

    // 验证请求参数
    if (
      !syncedMessages ||
      !Array.isArray(syncedMessages) ||
      syncedMessages.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid messages data" },
        { status: 400 }
      );
    }

    const totalMessageCount = syncedMessages.length;

    console.log("---Messages received:", totalMessageCount);

    // 验证用户只能发送消息到自己的频道并格式化消息
    const validMessages = [];
    for (const msg of syncedMessages) {
      // 支持snake_case或camelCase属性命名
      const channelId = msg.channel_id || msg.channelId;
      if (!channelId) continue;

      // 频道ID格式：$user_id:$channel_type:$platform_id
      const channelUserId = channelId.split(":")[0];

      if (channelUserId === userId) {
        // 转换消息格式以匹配数据库列名
        validMessages.push({
          messageId: msg.message_id || msg.messageId,
          channelId: channelId,
          chatId: msg.chat_id || msg.chatId,
          messageText: msg.message_text || msg.messageText,
          messageTimestamp: msg.message_timestamp || msg.messageTimestamp,
          senderId: msg.sender_id || msg.senderId || "",
          sender: msg.sender || {},
          sendUsername: msg.sender?.username,
          sendFirstname: msg.sender?.firstName,
          sendLastname: msg.sender?.lastName,
          replyTo: msg.reply_to || msg.replyTo,
          topicId: msg.topic_id || msg.topicId,
          isPinned: msg.is_pinned || msg.isPinned || false,
          buttons: msg.buttons || [],
          reactions: msg.reactions || [],
          mediaType: msg.media_type || msg.mediaType,
          mediaFileId: msg.media_file_id || msg.mediaFileId,
          mediaUrl: msg.media_url || msg.mediaUrl,
          mediaMetadata: msg.media_metadata || msg.mediaMetadata || {},
        });
      }
    }

    const syncedMessageCount = validMessages.length;

    if (syncedMessageCount === 0) {
      return NextResponse.json(
        {
          code: 403,
          message: "No valid messages to process",
          data: {
            total_message_count: totalMessageCount,
            synced_message_count: 0,
          },
        },
        { status: 403 }
      );
    }

    // 将消息分批插入，每批最多1000条
    const BATCH_SIZE = 1000;
    // let insertedCount = 0;

    for (let i = 0; i < validMessages.length; i += BATCH_SIZE) {
      const batch = validMessages.slice(i, i + BATCH_SIZE);
      // await db
      //   .insert(messages)
      //   .values(batch)
      //   .onConflictDoNothing({
      //     target: [messages.channelId, messages.messageId]
      //   });
      await prisma.tg_messages.upsert({
        where: {
          channel_id_message_id: {
            channel_id: batch[0].channelId,
            message_id: batch[0].messageId,
          },
        },
        update: {},
        create: {
          channel_id: batch[0].channelId,
          message_id: batch[0].messageId,
          chat_id: batch[0].chatId,
          message_text: batch[0].messageText,
          message_timestamp: batch[0].messageTimestamp,
          sender_id: batch[0].senderId,
          sender: batch[0].sender,
          send_username: batch[0].sendUsername,
          send_firstname: batch[0].sendFirstname,
          send_lastname: batch[0].sendLastname,
          reply_to: batch[0].replyTo,
          topic_id: batch[0].topicId,
          is_pinned: batch[0].isPinned,
          buttons: batch[0].buttons,
          reactions: batch[0].reactions,
          media_type: batch[0].mediaType,
          media_file_id: batch[0].mediaFileId,
          media_url: batch[0].mediaUrl,
          media_metadata: batch[0].mediaMetadata,
        },
      });
      // insertedCount += batch.length;
    }

    // 仅更新一次channel的最后同步时间
    if (validMessages.length > 0) {
      // await db
      //   .update(channels)
      //   .set({ lastSyncedAt: new Date() })
      //   .where(eq(channels.channelId, validMessages[0].channelId));
      await prisma.tg_channels.update({
        where: {
          channel_id: validMessages[0].channelId,
        },
        data: {
          last_synced_at: new Date(),
        },
      });
    }

    // 返回同步结果
    return NextResponse.json({
      code: 200,
      message: "success",
      data: {
        total_message_count: totalMessageCount,
        synced_message_count: syncedMessageCount,
      },
    });
  } catch (error) {
    console.error("Failed to batch insert messages:", error);
    return NextResponse.json(
      {
        code: 500,
        message: "Failed to process messages",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}