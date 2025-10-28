import { PrismaClient, Role, Tier, EventState } from "@prisma/client"
import * as bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@dorobats.com" },
    update: {},
    create: {
      email: "admin@dorobats.com",
      name: "Admin User",
      passwordHash: adminPassword,
      roles: [Role.ADMIN, Role.EDITOR, Role.VIEWER],
      player: {
        create: {
          rating: 350,
          tier: Tier.MASTERS,
          status: "ACTIVE",
        },
      },
    },
  })
  console.log("✅ Created admin:", admin.email)

  // Create Editors
  const editorPassword = await bcrypt.hash("editor123", 10)
  const editors = await Promise.all([
    prisma.user.upsert({
      where: { email: "tiago@dorobats.com" },
      update: {},
      create: {
        email: "tiago@dorobats.com",
        name: "Tiago Moreira",
        passwordHash: editorPassword,
        roles: [Role.EDITOR, Role.VIEWER],
        player: {
          create: {
            rating: 320,
            tier: Tier.MASTERS,
            status: "ACTIVE",
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "pablo@dorobats.com" },
      update: {},
      create: {
        email: "pablo@dorobats.com",
        name: "Pablo Silva",
        passwordHash: editorPassword,
        roles: [Role.EDITOR, Role.VIEWER],
        player: {
          create: {
            rating: 305,
            tier: Tier.MASTERS,
            status: "ACTIVE",
          },
        },
      },
    }),
  ])
  console.log("✅ Created editors:", editors.length)

  // Create Viewers (Players)
  const viewerPassword = await bcrypt.hash("player123", 10)
  const playerNames = [
    "Ana Costa",
    "Bruno Alves",
    "Carlos Mendes",
    "Diana Ferreira",
    "Eduardo Santos",
    "Filipa Rocha",
    "Gonçalo Lima",
    "Helena Martins",
    "Igor Pereira",
    "Joana Ribeiro",
    "Kevin Sousa",
    "Laura Oliveira",
    "Miguel Cardoso",
    "Nuno Fernandes",
    "Olga Pinto",
    "Pedro Gomes",
    "Raquel Dias",
    "Sérgio Lopes",
    "Teresa Nunes",
    "Vasco Reis",
  ]

  const viewers = await Promise.all(
    playerNames.map((name, index) => {
      const rating = 150 + Math.floor(Math.random() * 200) // 150-350
      return prisma.user.upsert({
        where: { email: `${name.toLowerCase().replace(" ", ".")}@dorobats.com` },
        update: {},
        create: {
          email: `${name.toLowerCase().replace(" ", ".")}@dorobats.com`,
          name,
          passwordHash: viewerPassword,
          roles: [Role.VIEWER],
          player: {
            create: {
              rating,
              tier: rating >= 300 ? Tier.MASTERS : Tier.EXPLORERS,
              status: "ACTIVE",
            },
          },
        },
      })
    }),
  )
  console.log("✅ Created viewers:", viewers.length)

  // Create Venue
  const venue = await prisma.venue.upsert({
    where: { id: "venue-dorobats" },
    update: {},
    create: {
      id: "venue-dorobats",
      name: "Clube Dorobats",
      address: "Rua do Padel, 123, Lisboa",
    },
  })
  console.log("✅ Created venue:", venue.name)

  // Create Courts
  const courts = await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      prisma.court.upsert({
        where: { id: `court-${i + 1}` },
        update: {},
        create: {
          id: `court-${i + 1}`,
          venueId: venue.id,
          label: `Campo ${i + 1}`,
        },
      }),
    ),
  )
  console.log("✅ Created courts:", courts.length)

  // Create upcoming event (Friday night)
  const nextFriday = new Date()
  nextFriday.setDate(nextFriday.getDate() + ((5 - nextFriday.getDay() + 7) % 7 || 7))
  nextFriday.setHours(20, 0, 0, 0)

  const eventEnd = new Date(nextFriday)
  eventEnd.setHours(21, 30, 0, 0)

  const rsvpOpens = new Date()
  rsvpOpens.setDate(rsvpOpens.getDate() + ((2 - rsvpOpens.getDay() + 7) % 7)) // Next Tuesday
  rsvpOpens.setHours(21, 0, 0, 0)

  const rsvpCloses = new Date(nextFriday)
  rsvpCloses.setHours(14, 0, 0, 0)

  const event = await prisma.event.create({
    data: {
      title: "Sexta à Noite - Explorers & Masters",
      date: nextFriday,
      startsAt: nextFriday,
      endsAt: eventEnd,
      venueId: venue.id,
      capacity: 24,
      rsvpOpensAt: rsvpOpens,
      rsvpClosesAt: rsvpCloses,
      state: EventState.DRAFT,
      tierRules: {
        explorers: { min: 0, max: 299 },
        masters: { min: 300, max: 999 },
      },
    },
  })
  console.log("✅ Created event:", event.title)

  // Create some RSVPs
  const allPlayers = await prisma.playerProfile.findMany({
    take: 18,
    include: { user: true },
  })

  for (let i = 0; i < allPlayers.length; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: event.id,
        playerId: allPlayers[i].id,
        status: i < 24 ? "CONFIRMED" : "WAITLISTED",
        position: i < 24 ? 0 : i - 23,
      },
    })
  }
  console.log("✅ Created RSVPs:", allPlayers.length)

  console.log("🎉 Seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
