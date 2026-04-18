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
    // If courts are being updated, we need to replace them. NOTE: deleting a
    // Court sets `Assignment.courtId` / `Match.courtId` to NULL on historical
    // rows (optional FK default). This is an existing data-integrity quirk
    // worth revisiting — replacing courts should probably diff labels and
    // only add/remove, not nuke the whole set. For now we at least wrap the
    // delete + recreate in a transaction so partial failures don't leave the
    // venue with no courts.
    if (dto.courts !== undefined) {
      const courts = dto.courts;
      return this.prisma.$transaction(async (tx) => {
        await tx.court.deleteMany({ where: { venueId: id } });
        return tx.venue.update({
          where: { id },
          data: {
            name: dto.name,
            address: dto.address,
            logo: dto.logo,
            courts: {
              create: courts.map((label) => ({ label })),
            },
          },
          include: {
            courts: {
              orderBy: { label: 'asc' },
            },
          },
        });
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
