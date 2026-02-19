import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import type { CreateInvitationDto, Invitation, InvitationValidationResponse } from '@padel/types';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(dto: CreateInvitationDto, invitedBy: string): Promise<Invitation> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: dto.email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw new ConflictException('An active invitation already exists for this email');
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Calculate expiration date (default 7 days)
    const expiresInDays = dto.expiresInDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Create invitation
    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email,
        token,
        invitedBy,
        expiresAt,
      },
      include: {
        invitedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send invitation email
    try {
      await this.emailService.sendInvitationEmail(
        dto.email,
        token,
        invitation.invitedByUser?.name || 'Admin'
      );
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      // Don't fail the invitation creation if email fails
    }

    return invitation as Invitation;
  }

  async validate(token: string): Promise<InvitationValidationResponse> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return {
        valid: false,
        message: 'Invalid invitation token',
      };
    }

    if (invitation.status === 'REVOKED') {
      return {
        valid: false,
        message: 'This invitation has been revoked',
      };
    }

    if (invitation.status === 'ACCEPTED') {
      return {
        valid: false,
        message: 'This invitation has already been used',
      };
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });

      return {
        valid: false,
        message: 'This invitation has expired',
      };
    }

    return {
      valid: true,
      email: invitation.email,
    };
  }

  async markAsUsed(token: string): Promise<void> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        usedAt: new Date(),
      },
    });
  }

  async list(userId?: string): Promise<Invitation[]> {
    const where = userId ? { invitedBy: userId } : {};

    const invitations = await this.prisma.invitation.findMany({
      where,
      include: {
        invitedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations as Invitation[];
  }

  async revoke(id: string, userId: string): Promise<Invitation> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Only the user who created the invitation or an admin can revoke it
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (invitation.invitedBy !== userId && !user?.roles.includes('ADMIN')) {
      throw new BadRequestException('You do not have permission to revoke this invitation');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new BadRequestException('Cannot revoke an invitation that has already been accepted');
    }

    const updated = await this.prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' },
      include: {
        invitedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updated as Invitation;
  }

  async getById(id: string): Promise<Invitation> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
      include: {
        invitedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation as Invitation;
  }
}
