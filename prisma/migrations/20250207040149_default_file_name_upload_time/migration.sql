/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Files` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Files" ALTER COLUMN "uploadTime" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Files_name_key" ON "Files"("name");
