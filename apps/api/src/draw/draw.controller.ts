import { Controller, Get, Post, Patch, UseGuards, Param, Body, Request } from "@nestjs/common"
import { DrawService } from "./draw.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Role } from "@padel/types"

@Controller("draws")
@UseGuards(JwtAuthGuard)
export class DrawController {
  constructor(private drawService: DrawService) {}

  @Post("events/:eventId")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async generateDraw(@Param("eventId") eventId: string, @Body() body: { constraints?: any }, @Request() req: any) {
    return this.drawService.generateDraw(eventId, req.user.sub, body.constraints)
  }

  @Get("events/:eventId")
  async getDraw(@Param("eventId") eventId: string) {
    return this.drawService.getDraw(eventId)
  }

  @Patch("assignments/:assignmentId")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async updateAssignment(@Param("assignmentId") assignmentId: string, @Body() body: { teamA: string[]; teamB: string[] }, @Request() req: any) {
    return this.drawService.updateAssignment(assignmentId, body.teamA, body.teamB, req.user.sub)
  }

  @Post("events/:eventId/publish")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async publishDraw(@Param("eventId") eventId: string) {
    return this.drawService.publishDraw(eventId)
  }
}
