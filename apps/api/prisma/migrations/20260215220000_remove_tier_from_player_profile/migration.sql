-- DropIndex
DROP INDEX IF EXISTS "PlayerProfile_tier_rating_idx";

-- AlterTable
ALTER TABLE "PlayerProfile" DROP COLUMN IF EXISTS "tier";

-- CreateIndex
CREATE INDEX "PlayerProfile_rating_idx" ON "PlayerProfile"("rating");

