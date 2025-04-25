import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/r2";

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, api_key",
};

// Maximum number of concurrent uploads
const MAX_CONCURRENT_UPLOADS = 5;

// Process items concurrently with limited concurrency
async function processConcurrent<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = MAX_CONCURRENT_UPLOADS
): Promise<R[]> {
  const results: R[] = [];
  const inProgress = new Set<Promise<void>>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const task = (async () => {
      try {
        const result = await fn(item);
        results[i] = result; // Preserve original order
      } catch (error) {
        results[i] = error as R;
      }
    })();

    inProgress.add(task);
    void task.then(() => {
      inProgress.delete(task);
    });

    if (inProgress.size >= concurrency) {
      await Promise.race(inProgress);
    }
  }

  await Promise.all(inProgress);
  return results;
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

    const userId = user.id;
    console.log("---User found:", user);

    // TODO Check user credit

    // Parse request body
    const body = await req.json();
    const { photos, channelsToCreate } = body;

    if (
      !channelsToCreate ||
      !Array.isArray(channelsToCreate) ||
      channelsToCreate.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "No channels to create" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("---Channels to create:", channelsToCreate);

    // Upload photos if provided
    let uploadResults: Record<string, string> = {};
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const results = await processConcurrent(photos, async (item) => {
        try {
          // Convert base64 to Buffer
          const base64Data = item.photo.replace(/^data:image\/\w+;base64,/, "");
          const photoBuffer = Buffer.from(base64Data, "base64");

          // Upload to R2
          await uploadFile(photoBuffer, item.path);

          return {
            groupId: item.groupId,
            photoPath: item.path,
            success: true,
          };
        } catch (error) {
          console.error(
            `Failed to upload photo for group ${item.groupId}:`,
            error
          );
          return {
            groupId: item.groupId,
            photoPath: null,
            success: false,
            error: error instanceof Error ? error.message : "Upload failed",
          };
        }
      });

      // Create map of groupId to photoPath
      uploadResults = results.reduce(
        (acc: Record<string, string>, item: any) => {
          if (item.success && item.photoPath) {
            acc[item.groupId] = item.photoPath;
          }
          return acc;
        },
        {}
      );
    }

    // Update channels with photo paths
    const channelsWithPhotos = channelsToCreate.map((channel: any) => {
      const groupId = channel.platform_id;
      if (uploadResults[groupId]) {
        return {
          ...channel,
          metadata: {
            ...channel.metadata,
            photo: uploadResults[groupId],
          },
        };
      }
      return channel;
    });

    // Insert or update channels
    const results = {
      channel_id: [] as string[],
      errors: [] as { channel_id: string; err_msg: string }[],
    };

    await Promise.all(
      channelsWithPhotos.map(async (channel: any) => {
        try {
          // Validate required fields
          if (!channel.channel_type || !channel.platform_id) {
            throw new Error(
              "Missing required fields: channel_type, platform_id, or metadata"
            );
          }

          // Format channel_id
          const channelId = `${userId}:${channel.channel_type}:${channel.platform_id}`;

          // await db
          //   .insert(channels)
          //   .values({
          //     channelId,
          //     userId,
          //     dataType: channel.channel_type,
          //     dataId: channel.platform_id,
          //     metadata: channel.metadata || {},
          //     isPublic: channel.is_public === true,
          //     isFree: channel.is_free === true,
          //     subscriptionFee: channel.subscription_fee,
          //     tags: channel.tags || [],
          //     lastSyncedAt: new Date(),
          //     status: "watching",
          //   })
          //   .onConflictDoUpdate({
          //     target: [channels.userId, channels.dataId],
          //     set: {
          //       isPublic: channel.is_public === true,
          //       isFree: channel.is_free === true,
          //       subscriptionFee: channel.subscription_fee,
          //       tags: channel.tags || [],
          //       lastSyncedAt: new Date(),
          //       updatedAt: new Date(),
          //     },
          //   });

          const channelData = {
            channel_id: channelId,
            user_id: userId,
            data_type: channel.channel_type,
            data_id: channel.platform_id,
            metadata: channel.metadata || {},
            is_public: channel.is_public === true,
            is_free: channel.is_free === true,
            subscription_fee: channel.subscription_fee,
            // tags: channel.tags ? JSON.stringify(channel.tags) : JSON.stringify([]),
            last_synced_at: new Date(),
            status: "watching",
          };

          await prisma.tg_channels.upsert({
            where: {
              channel_id: channelId,
            },
            update: {
              ...channelData,
              updated_at: new Date(),
            },
            create: {
              ...channelData,
            },
          });

          results.channel_id.push(channelId);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          const failedChannelId = `${userId}:${channel.channel_type}:${channel.platform_id}`;

          results.errors.push({
            channel_id: failedChannelId,
            err_msg: errorMessage,
          });
        }
      })
    );

    return NextResponse.json({
      code: 200,
      message: "success",
      data: results,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error importing groups:", error);
    return NextResponse.json(
      {
        code: 500,
        message: "Failed to import groups",
        data: null,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}