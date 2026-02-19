import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateVenueDto, UpdateVenueDto } from '@padel/types';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.venue.findMany({
      include: {
        courts: {
          orderBy: {
            label: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.venue.findUnique({
      where: { id },
      include: {
        courts: {
          orderBy: {
            label: 'asc',
          },
        },
      },
    });
  }

  async create(dto: CreateVenueDto) {
    return this.prisma.venue.create({
      data: {
        name: dto.name,
        address: dto.address,
        logo: dto.logo,
        courts: {
          create: dto.courts.map((label) => ({
            label,
          })),
        },
      },
      include: {
        courts: {
          orderBy: {
            label: 'asc',
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateVenueDto) {
    // If courts are being updated, we need to replace them
    if (dto.courts !== undefined) {
      // Delete existing courts and create new ones
      await this.prisma.court.deleteMany({
        where: { venueId: id },
      });

      return this.prisma.venue.update({
        where: { id },
        data: {
          name: dto.name,
          address: dto.address,
          logo: dto.logo,
          courts: {
            create: dto.courts.map((label) => ({
              label,
            })),
          },
        },
        include: {
          courts: {
            orderBy: {
              label: 'asc',
            },
          },
        },
      });
    }

    // If only updating venue details (no courts)
    return this.prisma.venue.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        logo: dto.logo,
      },
      include: {
        courts: {
          orderBy: {
            label: 'asc',
          },
        },
      },
    });
  }

  async delete(id: string) {
    // Prisma will cascade delete courts automatically
    return this.prisma.venue.delete({
      where: { id },
    });
  }
}
