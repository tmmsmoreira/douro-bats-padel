-- CreateIndex
CREATE INDEX "Court_venueId_idx" ON "Court"("venueId");

-- CreateIndex
CREATE INDEX "Draw_eventId_createdAt_idx" ON "Draw"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "RankingSnapshot_eventId_idx" ON "RankingSnapshot"("eventId");
