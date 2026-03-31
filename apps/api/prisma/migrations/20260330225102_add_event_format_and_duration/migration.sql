-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('NON_STOP');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "format" "EventFormat" NOT NULL DEFAULT 'NON_STOP';
