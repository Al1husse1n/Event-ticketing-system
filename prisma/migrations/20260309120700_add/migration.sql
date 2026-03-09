/*
  Warnings:

  - You are about to drop the column `available_seats` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `event_date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `total_seats` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `idempotency_key` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `reservation_id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `expires_at` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Reservation` table. All the data in the column will be lost.
  - The `version` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,eventId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `availableSeats` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalSeats` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idempotencyKey` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reservationId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('ORGANIZER', 'CUSTOMER');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_reservation_id_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_event_id_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_user_id_fkey";

-- DropIndex
DROP INDEX "Event_event_date_idx";

-- DropIndex
DROP INDEX "Payment_created_at_idx";

-- DropIndex
DROP INDEX "Payment_idempotency_key_key";

-- DropIndex
DROP INDEX "Payment_reservation_id_idx";

-- DropIndex
DROP INDEX "Reservation_event_id_idx";

-- DropIndex
DROP INDEX "Reservation_expires_at_idx";

-- DropIndex
DROP INDEX "Reservation_user_id_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "available_seats",
DROP COLUMN "created_at",
DROP COLUMN "event_date",
DROP COLUMN "total_seats",
ADD COLUMN     "availableSeats" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalSeats" INTEGER NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "created_at",
DROP COLUMN "idempotency_key",
DROP COLUMN "reservation_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idempotencyKey" TEXT NOT NULL,
ADD COLUMN     "reservationId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "created_at",
DROP COLUMN "event_id",
DROP COLUMN "expires_at",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'RESERVED',
DROP COLUMN "version",
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "userRole" NOT NULL DEFAULT 'CUSTOMER';

-- CreateIndex
CREATE INDEX "Event_eventDate_idx" ON "Event"("eventDate");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_reservationId_idx" ON "Payment"("reservationId");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_eventId_idx" ON "Reservation"("eventId");

-- CreateIndex
CREATE INDEX "Reservation_expiresAt_idx" ON "Reservation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_userId_eventId_key" ON "Reservation"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
