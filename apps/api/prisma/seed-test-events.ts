import { PrismaClient, EventState } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test events...');

  // Get the first venue (or create one if none exists)
  let venue = await prisma.venue.findFirst();
  if (!venue) {
    venue = await prisma.venue.create({
      data: {
        name: 'Test Padel Club',
        address: '123 Test Street, Porto, Portugal',
      },
    });
    console.log('✅ Created test venue');
  }

  // Get courts for the venue (or create them)
  let courts = await prisma.court.findMany({
    where: { venueId: venue.id },
    take: 4,
  });

  if (courts.length === 0) {
    console.log('⚠️  No courts found. Creating test courts...');
    for (let i = 1; i <= 4; i++) {
      await prisma.court.create({
        data: {
          label: `Court ${i}`,
          venueId: venue.id,
        },
      });
    }
    courts = await prisma.court.findMany({
      where: { venueId: venue.id },
      take: 4,
    });
    console.log('✅ Created 4 test courts');
  }

  // Get or create test players
  const players = await prisma.playerProfile.findMany({
    take: 16,
    include: { user: true },
  });

  if (players.length < 16) {
    console.log(
      '⚠️  Not enough players found. Need at least 16 players to create realistic test events.'
    );
    console.log(`   Found ${players.length} players. Please create more players first.`);
    return;
  }

  console.log(`✅ Found ${players.length} players for test events`);

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Helper to create event
  const createEvent = async (
    title: string,
    daysOffset: number,
    state: EventState,
    capacity: number = 16
  ) => {
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() + daysOffset);

    const startsAt = new Date(eventDate);
    startsAt.setHours(19, 0, 0, 0);

    const endsAt = new Date(eventDate);
    endsAt.setHours(22, 0, 0, 0);

    const rsvpOpensAt = new Date(eventDate);
    rsvpOpensAt.setDate(rsvpOpensAt.getDate() - 7);

    const rsvpClosesAt = new Date(eventDate);
    rsvpClosesAt.setHours(12, 0, 0, 0);

    const event = await prisma.event.create({
      data: {
        title,
        date: eventDate,
        startsAt,
        endsAt,
        venueId: venue.id,
        capacity,
        rsvpOpensAt,
        rsvpClosesAt,
        state,
        tierRules: {
          topPercentage: 0.4,
          mastersTier: 'MASTERS',
          explorersTier: 'EXPLORERS',
        },
      },
    });

    // Add event courts
    for (const court of courts) {
      await prisma.eventCourt.create({
        data: {
          eventId: event.id,
          courtId: court.id,
        },
      });
    }

    return event;
  };

  // 1. Past event - PUBLISHED (with RSVPs and draw, ready for results)
  const pastPublished = await createEvent('Past Event - Published', -14, EventState.PUBLISHED);

  // Add RSVPs for this event
  for (const player of players) {
    await prisma.rSVP.create({
      data: {
        eventId: pastPublished.id,
        playerId: player.id,
        status: 'CONFIRMED',
      },
    });
  }

  // Create a draw for this event
  const draw = await prisma.draw.create({
    data: {
      eventId: pastPublished.id,
      createdBy: players[0].userId, // Use first player's user as creator
      constraintsJson: {
        algorithm: 'BALANCED',
        seed: Math.random().toString(),
      },
    },
  });

  // Create assignments (matches) - 4 courts, 2 rounds, 16 players
  // Round 1: 4 matches (8 players per court)
  for (let courtIndex = 0; courtIndex < 4; courtIndex++) {
    const teamAPlayers = [players[courtIndex * 2].id, players[courtIndex * 2 + 1].id];
    const teamBPlayers = [players[courtIndex * 2 + 8].id, players[courtIndex * 2 + 9].id];

    await prisma.assignment.create({
      data: {
        drawId: draw.id,
        courtId: courts[courtIndex].id,
        round: 1,
        teamA: teamAPlayers,
        teamB: teamBPlayers,
        tier: courtIndex < 2 ? 'MASTERS' : 'EXPLORERS',
      },
    });
  }

  // Round 2: 4 matches (rotate players)
  for (let courtIndex = 0; courtIndex < 4; courtIndex++) {
    const offset = (courtIndex + 2) % 8;
    const teamAPlayers = [players[offset].id, players[offset + 8].id];
    const teamBPlayers = [players[(offset + 1) % 8].id, players[((offset + 1) % 8) + 8].id];

    await prisma.assignment.create({
      data: {
        drawId: draw.id,
        courtId: courts[courtIndex].id,
        round: 2,
        teamA: teamAPlayers,
        teamB: teamBPlayers,
        tier: courtIndex < 2 ? 'MASTERS' : 'EXPLORERS',
      },
    });
  }

  console.log(
    `✅ Created: ${pastPublished.title} (${pastPublished.state}) with ${players.length} RSVPs and draw`
  );

  // 2. Today's event - FROZEN (ready for draw generation)
  const todayFrozen = await createEvent("Today's Event - Frozen", 0, EventState.FROZEN);

  // Add RSVPs for the frozen event so draw can be generated
  for (const player of players) {
    await prisma.rSVP.create({
      data: {
        eventId: todayFrozen.id,
        playerId: player.id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(
    `✅ Created: ${todayFrozen.title} (${todayFrozen.state}) with ${players.length} RSVPs`
  );

  // 4. Future event - OPEN (accepting RSVPs)
  const futureOpen = await createEvent('Next Week - Open for RSVP', 7, EventState.OPEN);
  console.log(`✅ Created: ${futureOpen.title} (${futureOpen.state})`);

  // 5. Future event - DRAFT (not published yet)
  const futureDraft = await createEvent('Future Event - Draft', 14, EventState.DRAFT);
  console.log(`✅ Created: ${futureDraft.title} (${futureDraft.state})`);

  // 6. Far future event - OPEN
  const farFuture = await createEvent('Month Ahead - Open', 30, EventState.OPEN);
  console.log(`✅ Created: ${farFuture.title} (${farFuture.state})`);

  console.log('\n🎉 Test events created successfully!');
  console.log('\nEvent States Summary:');
  console.log('- DRAFT: Event created but not published');
  console.log('- OPEN: Published and accepting RSVPs');
  console.log('- FROZEN: RSVPs closed, ready for draw generation');
  console.log('- PUBLISHED: Draw published, event completed, ready for results entry');
  console.log('\n📝 Events with RSVPs:');
  console.log(
    '   - Past PUBLISHED event: Has 16 RSVPs and complete draw (ready for results entry)'
  );
  console.log('   - Today FROZEN event: Has 16 RSVPs (ready for draw generation)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
