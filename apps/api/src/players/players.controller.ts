import { Controller, Get, Param, UseGuards } from "@nestjs/common"
import { PlayersService } from "./players.service"
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard"
import { Public } from "../auth/decorators/public.decorator"

@Controller("players")
@UseGuards(OptionalJwtAuthGuard)
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  @Public()
  @Get()
  async findAll() {
    return this.playersService.findAll()
  }

  @Public()
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.playersService.findOne(id)
  }
}

