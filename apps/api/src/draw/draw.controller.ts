import { Controller, Get, Post, Patch, UseGuards } from "@nestjs/common"
import type { DrawService } from "./draw.service"
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
  async generateDraw(eventId: string, body: { constraints?: any }, req: any) {
    return this.drawService.generateDraw(eventId, req.user.sub, body.constraints)
  }

  @Get("events/:eventId")
  async getDraw(eventId: string) {
    return this.drawService.getDraw(eventId)
  }

  @Patch("assignments/:assignmentId")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async updateAssignment(assignmentId: string, body: { teamA: string[]; teamB: string[] }, req: any) {
    return this.drawService.updateAssignment(assignmentId, body.teamA, body.teamB, req.user.sub)
  }

  @Post("events/:eventId/publish")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async publishDraw(eventId: string) {
    return this.drawService.publishDraw(eventId)
  }
}
