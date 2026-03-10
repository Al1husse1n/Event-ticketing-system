/*
  Warnings:

  - Added the required column `category` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "eventCategory" AS ENUM ('CONFERENCE', 'WORKSHOP', 'MEETUP', 'CONCERT', 'EXHBITION', 'RELIGOUS', 'ONLINE', 'COMMUNITY', 'CEREMONY');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "category" "eventCategory" NOT NULL;
