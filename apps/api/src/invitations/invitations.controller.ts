import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type {
  CreateInvitationDto,
  ValidateInvitationDto,
  Invitation,
  InvitationValidationResponse,
} from '@padel/types';
import { Role } from '@padel/types';

@Controller('invitations')
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async create(@Body() dto: CreateInvitationDto, @Req() req: any): Promise<Invitation> {
    return this.invitationsService.create(dto, req.user.sub);
  }

  @Post('validate')
  async validate(@Body() dto: ValidateInvitationDto): Promise<InvitationValidationResponse> {
    return this.invitationsService.validate(dto.token);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async list(@Req() req: any): Promise<Invitation[]> {
    // Admins can see all invitations, editors only see their own
    const userId = req.user.roles.includes(Role.ADMIN) ? undefined : req.user.sub;
    return this.invitationsService.list(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async getById(@Param('id') id: string): Promise<Invitation> {
    return this.invitationsService.getById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  async revoke(@Param('id') id: string, @Req() req: any): Promise<Invitation> {
    return this.invitationsService.revoke(id, req.user.sub);
  }
}
