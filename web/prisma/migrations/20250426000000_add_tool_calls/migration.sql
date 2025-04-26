-- Add tool_calls column to messages table
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "tool_calls" JSONB;

-- Remove the default value from tool_calls column
ALTER TABLE "messages" ALTER COLUMN "tool_calls" DROP DEFAULT;

-- Update existing records where tool_calls is "{}" to NULL
UPDATE "messages" SET "tool_calls" = NULL WHERE "tool_calls" = '{}'; 