import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from "@nestjs/common"
import { EventsService } from "./events.service"
import { RSVPService } from "./rsvp.service"
import type { CreateEventDto, RSVPDto } from "@padel/types"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Public } from "../auth/decorators/public.decorator"
import { Role } from "@padel/types"

@Controller("events")
@UseGuards(OptionalJwtAuthGuard)
export class EventsController {
  constructor(
    private eventsService: EventsService,
    private rsvpService: RSVPService,
  ) {}

  @Public()
  @Get()
  async findAll(@Request() req: any, @Query("from") from?: string, @Query("to") to?: string) {
    const fromDate = from ? new Date(from) : undefined
    const toDate = to ? new Date(to) : undefined
    const userId = req.user?.sub

    return this.eventsService.findAll(fromDate, toDate, userId)
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: any) {
    const userId = req.user?.sub
    return this.eventsService.findOne(id, userId)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async create(@Body() dto: CreateEventDto, @Request() req: any) {
    return this.eventsService.create(dto, req.user.sub)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async update(@Param("id") id: string, @Body() dto: Partial<CreateEventDto>) {
    return this.eventsService.update(id, dto)
  }

  @Post(":id/publish")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async publish(@Param("id") id: string) {
    return this.eventsService.publish(id)
  }

  @Post(":id/freeze")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async freeze(@Param("id") id: string) {
    return this.eventsService.freeze(id)
  }

  @Post(":id/rsvp")
  async rsvp(@Param("id") id: string, @Body() dto: RSVPDto, @Request() req: any) {
    return this.rsvpService.handleRSVP(id, req.user.sub, dto)
  }

  @Post(":id/promote-waitlist")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async promoteWaitlist(@Param("id") id: string) {
    return this.rsvpService.autoPromoteWaitlist(id)
  }
}
