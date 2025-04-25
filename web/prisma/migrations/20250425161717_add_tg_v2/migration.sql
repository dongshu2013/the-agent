/*
  Warnings:

  - The primary key for the `tg_messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `buttons` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `channel_id` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `media_file_id` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `media_metadata` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `media_type` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `media_url` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `reactions` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `reply_to` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `send_firstname` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `send_lastname` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `send_username` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the column `topic_id` on the `tg_messages` table. All the data in the column will be lost.
  - You are about to drop the `tg_channels` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[chat_id,message_id]` on the table `tg_messages` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "tg_messages" DROP CONSTRAINT "tg_messages_channel_id_fkey";

-- DropIndex
DROP INDEX "tg_messages_channel_id_message_id_key";

-- AlterTable
ALTER TABLE "tg_messages" DROP CONSTRAINT "tg_messages_pkey",
DROP COLUMN "buttons",
DROP COLUMN "channel_id",
DROP COLUMN "media_file_id",
DROP COLUMN "media_metadata",
DROP COLUMN "media_type",
DROP COLUMN "media_url",
DROP COLUMN "reactions",
DROP COLUMN "reply_to",
DROP COLUMN "send_firstname",
DROP COLUMN "send_lastname",
DROP COLUMN "send_username",
DROP COLUMN "sender",
DROP COLUMN "topic_id",
ADD COLUMN     "reply_to_msg_id" TEXT,
ADD COLUMN     "sender_firstname" TEXT,
ADD COLUMN     "sender_lastname" TEXT,
ADD COLUMN     "sender_username" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tg_messages_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tg_messages_id_seq";

-- DropTable
DROP TABLE "tg_channels";

-- CreateTable
CREATE TABLE "tg_chats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "chat_type" TEXT NOT NULL,
    "chat_title" TEXT NOT NULL,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "subscription_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'watching',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tg_chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tg_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tg_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tg_chats_user_id_chat_id_key" ON "tg_chats"("user_id", "chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "tg_messages_chat_id_message_id_key" ON "tg_messages"("chat_id", "message_id");

-- AddForeignKey
ALTER TABLE "tg_messages" ADD CONSTRAINT "tg_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "tg_chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
