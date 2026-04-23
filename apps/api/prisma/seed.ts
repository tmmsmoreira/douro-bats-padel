import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Seed script bootstraps demo accounts with well-known passwords. Running
  // this against a production database would provision admin@dorobats.com with
  // `admin123`, so hard-block it.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to run seed script in production (NODE_ENV=production)');
  }

  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dorobats.com' },
    update: {},
    create: {
      email: 'admin@dorobats.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      roles: [Role.ADMIN, Role.VIEWER],
      emailVerified: true,
      player: {
        create: {
          rating: 350,
          status: 'ACTIVE',
        },
      },
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Additional admins (previously "editors" — EDITOR role was removed).
  const secondaryAdminPassword = await bcrypt.hash('editor123', 10);
  const admins = await Promise.all([
    prisma.user.upsert({
      where: { email: 'tiago@dorobats.com' },
      update: {},
      create: {
        email: 'tiago@dorobats.com',
        name: 'Tiago Moreira',
        passwordHash: secondaryAdminPassword,
        roles: [Role.ADMIN, Role.VIEWER],
        emailVerified: true,
        player: {
          create: {
            rating: 320,
            status: 'ACTIVE',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'pablo@dorobats.com' },
      update: {},
      create: {
        email: 'pablo@dorobats.com',
        name: 'Pablo Silva',
        passwordHash: secondaryAdminPassword,
        roles: [Role.ADMIN, Role.VIEWER],
        emailVerified: true,
        player: {
          create: {
            rating: 305,
            status: 'ACTIVE',
          },
        },
      },
    }),
  ]);
  console.log('✅ Created secondary admins:', admins.length);

  // Create Viewers (Players)
  const viewerPassword = await bcrypt.hash('player123', 10);
  const playerNames = [
    'Ana Costa',
    'Bruno Alves',
    'Carlos Mendes',
    'Diana Ferreira',
    'Eduardo Santos',
    'Filipa Rocha',
    'Gonçalo Lima',
    'Helena Martins',
    'Igor Pereira',
    'Joana Ribeiro',
    'Kevin Sousa',
    'Laura Oliveira',
    'Miguel Cardoso',
    'Nuno Fernandes',
    'Olga Pinto',
    'Pedro Gomes',
    'Raquel Dias',
    'Sérgio Lopes',
    'Teresa Nunes',
    'Vasco Reis',
  ];

  const viewers = await Promise.all(
    playerNames.map((name) => {
      const rating = 150 + Math.floor(Math.random() * 200); // 150-350
      return prisma.user.upsert({
        where: { email: `${name.toLowerCase().replace(' ', '.')}@dorobats.com` },
        update: {},
        create: {
          email: `${name.toLowerCase().replace(' ', '.')}@dorobats.com`,
          name,
          passwordHash: viewerPassword,
          roles: [Role.VIEWER],
          emailVerified: true,
          player: {
            create: {
              rating,
              status: 'ACTIVE',
            },
          },
        },
      });
    })
  );
  console.log('✅ Created viewers:', viewers.length);

  // Create Venue
  const venue = await prisma.venue.upsert({
    where: { id: 'venue-dorobats' },
    update: {},
    create: {
      id: 'venue-dorobats',
      name: 'Clube Dorobats',
      address: 'Rua do Padel, 123, Lisboa',
    },
  });
  console.log('✅ Created venue:', venue.name);

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
      })
    )
  );
  console.log('✅ Created courts:', courts.length);

  // Create Invitations
  const invitedPlayers = [
    { name: 'Sofia Carvalho', email: 'sofia.carvalho@example.com' },
    { name: 'Ricardo Tavares', email: 'ricardo.tavares@example.com' },
    { name: 'Beatriz Monteiro', email: 'beatriz.monteiro@example.com' },
    { name: 'André Correia', email: 'andre.correia@example.com' },
    { name: 'Mariana Fonseca', email: 'mariana.fonseca@example.com' },
  ];

  const invitations = await Promise.all(
    invitedPlayers.map((player) => {
      const token = `invite-${player.email.split('@')[0]}-${Date.now()}`;
      return prisma.invitation.upsert({
        where: { token },
        update: {},
        create: {
          email: player.email,
          name: player.name,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          invitedBy: admin.id,
        },
      });
    })
  );
  console.log('✅ Created invitations:', invitations.length);

  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('💡 To create test events with different states, run:');
  console.log('   pnpm prisma:seed-test-events');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
