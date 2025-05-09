/*
  Warnings:

  - A unique constraint covering the columns `[name,user_id]` on the table `models` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "models_name_user_id_key" ON "models"("name", "user_id");
