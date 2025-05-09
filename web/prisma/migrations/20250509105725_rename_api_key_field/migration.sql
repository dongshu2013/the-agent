/*
  Warnings:

  - You are about to drop the column `apiKey` on the `models` table. All the data in the column will be lost.
  - Added the required column `api_key` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "models" DROP COLUMN "apiKey",
ADD COLUMN     "api_key" TEXT NOT NULL;
