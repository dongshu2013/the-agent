/*
  Warnings:

  - You are about to alter the column `credits` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,6)`.

*/
-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "tool_calls" DROP NOT NULL,
ALTER COLUMN "tool_calls" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "credits" SET DATA TYPE DECIMAL(10,6);

-- CreateTable
CREATE TABLE "credit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(10,6) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "balance" DECIMAL(10,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "credit_logs" ADD CONSTRAINT "credit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
