import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RankingService } from '../ranking/ranking.service';
import type { Tier } from '@padel/types';

interface SubmitMatchDto {
  eventId: string;
  courtId: string;
  round: number;
  setsA: number;
  setsB: number;
  tier: Tier;
}

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private prisma: PrismaService,
    private rankingService: RankingService
  ) {}

  async submitMatch(dto: SubmitMatchDto, reportedBy: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Validate sets
    if (dto.setsA < 0 || dto.setsB < 0) {
      throw new BadRequestException('Sets cannot be negative');
    }

    if (dto.setsA > 20 || dto.setsB > 20) {
      throw new BadRequestException('Sets cannot exceed 20');
    }

    // Check if match already exists
    const existingMatch = await this.prisma.match.findFirst({
      where: {
        eventId: dto.eventId,
        courtId: dto.courtId,
        round: dto.round,
      },
    });

    if (existingMatch) {
      // Update existing match
      return this.prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          setsA: dto.setsA,
          setsB: dto.setsB,
          tier: dto.tier,
          reportedBy,
        },
      });
    }

    // Create new match
    return this.prisma.match.create({
      data: {
        eventId: dto.eventId,
        courtId: dto.courtId,
        round: dto.round,
        setsA: dto.setsA,
        setsB: dto.setsB,
        tier: dto.tier,
        reportedBy,
      },
    });
  }

  async publishMatches(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        matches: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.matches.length === 0) {
      throw new BadRequestException('No matches to publish');
    }

    // Publish all unpublished matches
    await this.prisma.match.updateMany({
      where: {
        eventId,
        publishedAt: null,
      },
      data: {
        publishedAt: new Date(),
      },
    });

    // Automatically compute rankings after publishing results
    try {
      await this.rankingService.computeRankingsForEvent(eventId);
    } catch (error) {
      // Log error but don't fail the publish operation
      this.logger.error('Failed to compute rankings:', error);
    }

    return {
      message: 'Matches published successfully and rankings updated',
      count: event.matches.length,
    };
  }

  async getMatches(eventId: string) {
    const matches = await this.prisma.match.findMany({
      where: { eventId },
      include: {
        court: true,
      },
      orderBy: [{ round: 'asc' }, { courtId: 'asc' }],
    });

    // Get draw to enrich with player names
    const draw = await this.prisma.draw.findFirst({
      where: { eventId },
      include: {
        assignments: true,
      },
    });

    if (!draw) {
      return matches;
    }

    // Get all player IDs
    const playerIds = new Set<string>();
    draw.assignments.forEach((a) => {
      a.teamA.forEach((id) => playerIds.add(id));
      a.teamB.forEach((id) => playerIds.add(id));
    });

    const players = await this.prisma.playerProfile.findMany({
      where: { id: { in: Array.from(playerIds) } },
      include: { user: true },
    });

    // Fetch rating snapshots for this event to show rating deltas
    const snapshots = await this.prisma.rankingSnapshot.findMany({
      where: { eventId, playerId: { in: Array.from(playerIds) } },
    });
    const snapshotMap = new Map(snapshots.map((s) => [s.playerId, s]));

    type PlayerWithUser = (typeof players)[0];
    const playerMap = new Map<string, PlayerWithUser>(players.map((p) => [p.id, p]));

    return matches.map((match) => {
      const assignment = draw.assignments.find(
        (a) => a.round === match.round && a.courtId === match.courtId
      );

      const mapPlayer = (id: string) => {
        const snapshot = snapshotMap.get(id);
        return {
          id,
          name: playerMap.get(id)?.user.name,
          rating: playerMap.get(id)?.rating,
          profilePhoto: playerMap.get(id)?.user.profilePhoto,
          ratingDelta: snapshot ? snapshot.after - snapshot.before : undefined,
        };
      };

      return {
        ...match,
        teamA: assignment?.teamA.map(mapPlayer),
        teamB: assignment?.teamB.map(mapPlayer),
      };
    });
  }
}
