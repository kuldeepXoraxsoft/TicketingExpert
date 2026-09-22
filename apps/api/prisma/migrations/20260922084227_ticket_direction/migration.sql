-- CreateEnum
CREATE TYPE "TicketDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "direction" "TicketDirection" NOT NULL DEFAULT 'INBOUND';
