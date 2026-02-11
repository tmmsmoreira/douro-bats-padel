import { Controller, Get, Param, UseGuards } from "@nestjs/common"
import { VenuesService } from "./venues.service"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"
import { Public } from "../auth/decorators/public.decorator"

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
}

