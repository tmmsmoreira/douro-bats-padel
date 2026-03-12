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

  // 1. Last Week - PUBLISHED (with RSVPs and draw, for testing consecutive week avoidance)
  const lastWeekPublished = await createEvent('Last Week - Published', -7, EventState.PUBLISHED);

  // Add RSVPs for this event (16 players)
  for (const player of players) {
    await prisma.rSVP.create({
      data: {
        eventId: lastWeekPublished.id,
        playerId: player.id,
        status: 'CONFIRMED',
      },
    });
  }

  // Create a draw for this event with specific team pairings
  const lastWeekDraw = await prisma.draw.create({
    data: {
      eventId: lastWeekPublished.id,
      createdBy: players[0].userId,
      constraintsJson: {
        avoidRecentSessions: 4,
        balanceStrength: true,
      },
    },
  });

  // Create specific team pairings that we'll want to avoid in the next event
  // Team 1: players[0] + players[1]
  // Team 2: players[2] + players[3]
  // Team 3: players[8] + players[9]
  // Team 4: players[10] + players[11]
  const lastWeekAssignments = [
    {
      courtIndex: 0,
      round: 1,
      teamA: [players[0].id, players[1].id],
      teamB: [players[2].id, players[3].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 1,
      round: 1,
      teamA: [players[4].id, players[5].id],
      teamB: [players[6].id, players[7].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 2,
      round: 1,
      teamA: [players[8].id, players[9].id],
      teamB: [players[10].id, players[11].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 1,
      teamA: [players[12].id, players[13].id],
      teamB: [players[14].id, players[15].id],
      tier: 'EXPLORERS',
    },
  ];

  for (const assignment of lastWeekAssignments) {
    await prisma.assignment.create({
      data: {
        drawId: lastWeekDraw.id,
        courtId: courts[assignment.courtIndex].id,
        round: assignment.round,
        teamA: assignment.teamA,
        teamB: assignment.teamB,
        tier: assignment.tier,
      },
    });
  }

  console.log(
    `✅ Created: ${lastWeekPublished.title} (${lastWeekPublished.state}) with ${players.length} RSVPs and draw`
  );

  // 2. This Week - FROZEN (ready for draw generation, should avoid last week's teams)
  const thisWeekFrozen = await createEvent(
    'This Week - Frozen (Test Duplicate Avoidance)',
    0,
    EventState.FROZEN
  );

  // Add same 16 players to test duplicate team avoidance
  for (const player of players) {
    await prisma.rSVP.create({
      data: {
        eventId: thisWeekFrozen.id,
        playerId: player.id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(
    `✅ Created: ${thisWeekFrozen.title} (${thisWeekFrozen.state}) with ${players.length} RSVPs`
  );

  // 3. Next Week - FROZEN with only 3 players (test minimum player validation)
  const nextWeekFrozen = await createEvent(
    'Next Week - Only 3 Players (Test Min Validation)',
    7,
    EventState.FROZEN
  );

  // Add only 3 players to test the minimum player requirement
  for (let i = 0; i < 3; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: nextWeekFrozen.id,
        playerId: players[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(
    `✅ Created: ${nextWeekFrozen.title} (${nextWeekFrozen.state}) with 3 RSVPs (below minimum)`
  );

  // 4. Week After - FROZEN with exactly 4 players (test minimum edge case)
  const weekAfterFrozen = await createEvent(
    'Week After - Exactly 4 Players (Min Edge Case)',
    14,
    EventState.FROZEN
  );

  // Add exactly 4 players
  for (let i = 0; i < 4; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: weekAfterFrozen.id,
        playerId: players[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(
    `✅ Created: ${weekAfterFrozen.title} (${weekAfterFrozen.state}) with 4 RSVPs (exactly minimum)`
  );

  // 5. Future - FROZEN with 8 players (test small draw)
  const futureFrozen = await createEvent('Future - 8 Players (Small Draw)', 21, EventState.FROZEN);

  // Add 8 players
  for (let i = 0; i < 8; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: futureFrozen.id,
        playerId: players[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(`✅ Created: ${futureFrozen.title} (${futureFrozen.state}) with 8 RSVPs`);

  // 6. Far Future - OPEN (accepting RSVPs)
  const farFutureOpen = await createEvent('Far Future - Open for RSVP', 28, EventState.OPEN);
  console.log(`✅ Created: ${farFutureOpen.title} (${farFutureOpen.state})`);

  // 7. Very Far Future - DRAFT (not published yet)
  const veryFarFutureDraft = await createEvent('Very Far Future - Draft', 35, EventState.DRAFT);
  console.log(`✅ Created: ${veryFarFutureDraft.title} (${veryFarFutureDraft.state})`);

  console.log('\n🎉 Test events created successfully!');
  console.log('\n📋 Event States Summary:');
  console.log('- DRAFT: Event created but not published');
  console.log('- OPEN: Published and accepting RSVPs');
  console.log('- FROZEN: RSVPs closed, ready for draw generation');
  console.log('- PUBLISHED: Draw published, event completed, ready for results entry');
  console.log('\n🧪 Test Scenarios Created:');
  console.log('   1. Last Week PUBLISHED: Has draw with specific team pairings');
  console.log('   2. This Week FROZEN: Same 16 players (test duplicate team avoidance)');
  console.log('   3. Next Week FROZEN: Only 3 players (test minimum validation - should fail)');
  console.log('   4. Week After FROZEN: Exactly 4 players (test minimum edge case - should work)');
  console.log('   5. Future FROZEN: 8 players (test small draw generation)');
  console.log('   6. Far Future OPEN: No RSVPs yet');
  console.log('   7. Very Far Future DRAFT: Not published yet');
  console.log('\n💡 Testing Tips:');
  console.log('   - Generate draw for "This Week" event to see duplicate team avoidance in action');
  console.log('   - Try to generate draw for "Next Week" event to see minimum player validation');
  console.log('   - Generate draw for "Week After" event to test exactly 4 players');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
