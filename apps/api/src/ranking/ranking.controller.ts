import { Controller, Get, Post, UseGuards, Param, Query } from "@nestjs/common"
import { RankingService } from "./ranking.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Public } from "../auth/decorators/public.decorator"
import { Role, type Tier } from "@padel/types"

@Controller("rankings")
@UseGuards(OptionalJwtAuthGuard)
export class RankingController {
  constructor(private rankingService: RankingService) {}

  @Post("compute/:eventId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async computeRankings(@Param("eventId") eventId: string) {
    return this.rankingService.computeRankingsForEvent(eventId)
  }

  @Public()
  @Get("leaderboard")
  async getLeaderboard(@Query("tier") tier?: string, @Query("limit") limit?: string) {
    const tierEnum = tier ? (tier.toUpperCase() as Tier) : undefined
    const limitNum = limit ? Number.parseInt(limit, 10) : 50
    return this.rankingService.getLeaderboard(tierEnum, limitNum)
  }

  @Public()
  @Get("players/:playerId/history")
  async getPlayerHistory(@Param("playerId") playerId: string) {
    return this.rankingService.getPlayerHistory(playerId)
  }
}
