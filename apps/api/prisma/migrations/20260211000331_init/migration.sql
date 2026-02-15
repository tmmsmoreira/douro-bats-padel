-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('MASTERS', 'EXPLORERS');

-- CreateEnum
CREATE TYPE "EventState" AS ENUM ('DRAFT', 'OPEN', 'FROZEN', 'DRAWN', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('CONFIRMED', 'WAITLISTED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "profilePhoto" TEXT,
    "roles" "Role"[],
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "tier" "Tier" NOT NULL DEFAULT 'EXPLORERS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "venueId" TEXT,
    "capacity" INTEGER NOT NULL,
    "seed" TEXT,
    "rsvpOpensAt" TIMESTAMP(3) NOT NULL,
    "rsvpClosesAt" TIMESTAMP(3) NOT NULL,
    "state" "EventState" NOT NULL DEFAULT 'DRAFT',
    "tierRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCourt" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,

    CONSTRAINT "EventCourt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "status" "RSVPStatus" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "constraintsJson" JSONB,
    "createdBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "courtId" TEXT,
    "round" INTEGER NOT NULL,
    "teamA" TEXT[],
    "teamB" TEXT[],

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "courtId" TEXT,
    "round" INTEGER NOT NULL,
    "setsA" INTEGER NOT NULL DEFAULT 0,
    "setsB" INTEGER NOT NULL DEFAULT 0,
    "tier" "Tier" NOT NULL,
    "reportedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyScore" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingSnapshot" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "eventId" TEXT,
    "before" INTEGER NOT NULL DEFAULT 0,
    "after" INTEGER NOT NULL DEFAULT 0,
    "algoVersion" TEXT NOT NULL DEFAULT 'v1',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerProfile_userId_key" ON "PlayerProfile"("userId");

-- CreateIndex
CREATE INDEX "PlayerProfile_tier_rating_idx" ON "PlayerProfile"("tier", "rating");

-- CreateIndex
CREATE INDEX "Event_date_state_idx" ON "Event"("date", "state");

-- CreateIndex
CREATE INDEX "EventCourt_eventId_idx" ON "EventCourt"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCourt_eventId_courtId_key" ON "EventCourt"("eventId", "courtId");

-- CreateIndex
CREATE INDEX "RSVP_eventId_status_position_idx" ON "RSVP"("eventId", "status", "position");

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_eventId_playerId_key" ON "RSVP"("eventId", "playerId");

-- CreateIndex
CREATE INDEX "Assignment_drawId_round_idx" ON "Assignment"("drawId", "round");

-- CreateIndex
CREATE INDEX "Match_eventId_publishedAt_idx" ON "Match"("eventId", "publishedAt");

-- CreateIndex
CREATE INDEX "WeeklyScore_playerId_weekStart_idx" ON "WeeklyScore"("playerId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyScore_playerId_weekStart_key" ON "WeeklyScore"("playerId", "weekStart");

-- CreateIndex
CREATE INDEX "RankingSnapshot_playerId_createdAt_idx" ON "RankingSnapshot"("playerId", "createdAt");

-- AddForeignKey
ALTER TABLE "PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCourt" ADD CONSTRAINT "EventCourt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCourt" ADD CONSTRAINT "EventCourt_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyScore" ADD CONSTRAINT "WeeklyScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSnapshot" ADD CONSTRAINT "RankingSnapshot_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
