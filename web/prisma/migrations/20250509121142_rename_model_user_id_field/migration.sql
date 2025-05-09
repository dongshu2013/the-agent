/*
  Warnings:

  - You are about to drop the column `userId` on the `models` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "models" DROP CONSTRAINT "models_userId_fkey";

-- DropIndex
DROP INDEX "models_userId_idx";

-- AlterTable
ALTER TABLE "models" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "models_user_id_idx" ON "models"("user_id");

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
