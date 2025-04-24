-- CreateTable
CREATE TABLE "tg_channels" (
    "id" SERIAL NOT NULL,
    "channel_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "data_id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "subscription_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'watching',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tg_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tg_messages" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "message_text" TEXT NOT NULL,
    "message_timestamp" BIGINT NOT NULL,
    "sender_id" TEXT,
    "sender" JSONB DEFAULT '{}',
    "reply_to" TEXT,
    "topic_id" TEXT,
    "buttons" JSONB DEFAULT '[]',
    "reactions" JSONB DEFAULT '[]',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "media_type" TEXT,
    "media_file_id" TEXT,
    "media_url" TEXT,
    "media_metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "send_username" TEXT,
    "send_firstname" TEXT,
    "send_lastname" TEXT,

    CONSTRAINT "tg_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tg_channels_channel_id_key" ON "tg_channels"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "tg_channels_user_id_data_id_key" ON "tg_channels"("user_id", "data_id");

-- CreateIndex
CREATE UNIQUE INDEX "tg_messages_channel_id_message_id_key" ON "tg_messages"("channel_id", "message_id");

-- AddForeignKey
ALTER TABLE "tg_messages" ADD CONSTRAINT "tg_messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "tg_channels"("channel_id") ON DELETE RESTRICT ON UPDATE CASCADE;
