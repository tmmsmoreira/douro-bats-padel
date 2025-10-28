import { Controller, Get, Post, Param, UseGuards, Request } from "@nestjs/common"
import type { MatchesService } from "./matches.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@padel/types"

@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async submitMatch(dto: any, @Request() req: any) {
    return this.matchesService.submitMatch(dto, req.user.sub)
  }

  @Post("events/:eventId/publish")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async publishMatches(@Param("eventId") eventId: string) {
    return this.matchesService.publishMatches(eventId)
  }

  @Get("events/:eventId")
  async getMatches(@Param("eventId") eventId: string) {
    return this.matchesService.getMatches(eventId)
  }
}
