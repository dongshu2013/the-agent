/*
  Warnings:

  - Added the required column `api_url` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "models" ADD COLUMN     "api_url" TEXT NOT NULL;
