-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INVITED');

-- AlterTable: Change status column from String to PlayerStatus enum
-- Step 1: Add a temporary column
ALTER TABLE "PlayerProfile" ADD COLUMN "status_new" "PlayerStatus";

-- Step 2: Copy data from old column to new column, defaulting to ACTIVE
UPDATE "PlayerProfile" SET "status_new" = 
  CASE 
    WHEN "status" = 'ACTIVE' THEN 'ACTIVE'::"PlayerStatus"
    WHEN "status" = 'INACTIVE' THEN 'INACTIVE'::"PlayerStatus"
    ELSE 'ACTIVE'::"PlayerStatus"
  END;

-- Step 3: Drop the old column
ALTER TABLE "PlayerProfile" DROP COLUMN "status";

-- Step 4: Rename the new column to status
ALTER TABLE "PlayerProfile" RENAME COLUMN "status_new" TO "status";

-- Step 5: Set NOT NULL and default
ALTER TABLE "PlayerProfile" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "PlayerProfile" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "PlayerProfile_status_idx" ON "PlayerProfile"("status");

