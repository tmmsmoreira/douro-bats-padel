import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from "@nestjs/common"
import { VenuesService } from "./venues.service"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"
import { RolesGuard } from "../auth/guards/roles.guard"
import { Roles } from "../auth/decorators/roles.decorator"
import { Public } from "../auth/decorators/public.decorator"
import { Role, type CreateVenueDto, type UpdateVenueDto } from "@padel/types"

@Controller("venues")
@UseGuards(OptionalJwtAuthGuard)
export class VenuesController {
  constructor(private venuesService: VenuesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.venuesService.findAll()
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.venuesService.findOne(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async create(@Body() dto: CreateVenueDto) {
    return this.venuesService.create(dto)
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async update(@Param("id") id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, dto)
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async delete(@Param("id") id: string) {
    return this.venuesService.delete(id)
  }
}

