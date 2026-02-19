import { Controller, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@padel/types';

@Controller('players')
@UseGuards(OptionalJwtAuthGuard)
export class PlayersController {
  constructor(private playersService: PlayersService) {}

  @Public()
  @Get()
  async findAll() {
    return this.playersService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EDITOR, Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
