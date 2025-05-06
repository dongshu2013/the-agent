/*
  Warnings:

  - Made the column `tool_calls` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "tool_calls" SET NOT NULL,
ALTER COLUMN "tool_calls" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "credits" DECIMAL(10,2) NOT NULL DEFAULT 0;
