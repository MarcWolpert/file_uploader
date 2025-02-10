/*
  Warnings:

  - You are about to drop the `CookieSession` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[path,name,userId]` on the table `Files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CookieSession" DROP CONSTRAINT "CookieSession_user_id_fkey";

-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "path" TEXT NOT NULL;

-- DropTable
DROP TABLE "CookieSession";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "Files_path_name_userId_key" ON "Files"("path", "name", "userId");
