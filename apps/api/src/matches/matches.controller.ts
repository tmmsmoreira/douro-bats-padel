import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@padel/types';
import type { RequestWithUser } from '../auth/types';
import { SubmitMatchDto } from './dto/submit-match.dto';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async submitMatch(@Body() dto: SubmitMatchDto, @Request() req: RequestWithUser) {
    return this.matchesService.submitMatch(dto, req.user.sub);
  }

  @Post('events/:eventId/publish')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async publishMatches(@Param('eventId') eventId: string) {
    return this.matchesService.publishMatches(eventId);
  }

  @Get('events/:eventId')
  async getMatches(@Param('eventId') eventId: string) {
    return this.matchesService.getMatches(eventId);
  }
}
