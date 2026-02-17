-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "tier" "Tier" NOT NULL DEFAULT 'EXPLORERS';

-- CreateIndex
CREATE INDEX "Assignment_drawId_tier_round_idx" ON "Assignment"("drawId", "tier", "round");
