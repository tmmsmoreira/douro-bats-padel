import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import type { CreateVenueDto } from "@padel/types"

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.venue.findMany({
      include: {
        courts: {
          orderBy: {
            label: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.venue.findUnique({
      where: { id },
      include: {
        courts: {
          orderBy: {
            label: "asc",
          },
        },
      },
    })
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
            label: "asc",
          },
        },
      },
    })
  }
}

