/*
  Warnings:

  - You are about to alter the column `amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,6)`.
  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `credits` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `credit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('new_user', 'order_pay', 'system_add', 'completion');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'completed', 'cancelled');

-- DropForeignKey
ALTER TABLE "credit_logs" DROP CONSTRAINT "credit_logs_user_id_fkey";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "credits" DECIMAL(10,6) NOT NULL DEFAULT 0,
ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,6),
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "credits";

-- DropTable
DROP TABLE "credit_logs";

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "conversation_id" TEXT,
    "model" TEXT,
    "amount" DECIMAL(10,6),
    "trans_credits" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "user_credits" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "trans_type" "TransactionType" NOT NULL DEFAULT 'new_user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3),

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
