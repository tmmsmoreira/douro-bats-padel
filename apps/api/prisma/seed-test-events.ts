import { PrismaClient, EventState } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test events...');

  // 🧹 Clear existing test events and related data
  console.log('🧹 Clearing existing events...');
  await prisma.assignment.deleteMany({});
  await prisma.draw.deleteMany({});
  await prisma.rSVP.deleteMany({});
  await prisma.eventCourt.deleteMany({});
  await prisma.event.deleteMany({});
  console.log('✅ Cleared all existing events and related data');

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

    // Split courts: first 2 for MASTERS, last 2 for EXPLORERS
    const mastersCourts = courts.slice(0, 2).map((c) => c.id);
    const explorersCourts = courts.slice(2, 4).map((c) => c.id);

    const event = await prisma.event.create({
      data: {
        title,
        date: eventDate,
        startsAt,
        endsAt,
        format: 'NON_STOP',
        duration: 90, // Default 90 minutes for all events
        venueId: venue.id,
        capacity,
        rsvpOpensAt,
        rsvpClosesAt,
        state,
        tierRules: {
          topPercentage: 0.4,
          mastersTier: 'MASTERS',
          explorersTier: 'EXPLORERS',
          mastersTimeSlot: {
            startsAt: '19:00',
            endsAt: '20:30',
            courtIds: mastersCourts,
          },
          explorersTimeSlot: {
            startsAt: '20:30',
            endsAt: '22:00',
            courtIds: explorersCourts,
          },
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

  // ========================================
  // 1. Past Event - PUBLISHED (2 weeks ago, completed with draw and results)
  // ========================================
  const pastPublished = await createEvent('Sunday Session - Feb 16', -14, EventState.PUBLISHED);

  // Add 16 RSVPs
  for (const player of players) {
    await prisma.rSVP.create({
      data: {
        eventId: pastPublished.id,
        playerId: player.id,
        status: 'CONFIRMED',
      },
    });
  }

  // Create a draw with team pairings
  const pastDraw = await prisma.draw.create({
    data: {
      eventId: pastPublished.id,
      createdBy: players[0].userId,
      constraintsJson: {
        avoidRecentSessions: 4,
        balanceStrength: true,
      },
    },
  });

  // Create assignments (16 players, 4 courts, 3 rounds)
  // Teams are fixed pairs; round-robin rotates matchups (4 teams per tier → 3 rounds)
  // MASTERS teams: T1(P0,P1) T2(P2,P3) T3(P4,P5) T4(P6,P7)
  // EXPLORERS teams: T1(P8,P9) T2(P10,P11) T3(P12,P13) T4(P14,P15)
  const pastAssignments = [
    // Round 1: T1vT4, T2vT3
    {
      courtIndex: 0,
      round: 1,
      teamA: [players[0].id, players[1].id],
      teamB: [players[6].id, players[7].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 1,
      round: 1,
      teamA: [players[2].id, players[3].id],
      teamB: [players[4].id, players[5].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 2,
      round: 1,
      teamA: [players[8].id, players[9].id],
      teamB: [players[14].id, players[15].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 1,
      teamA: [players[10].id, players[11].id],
      teamB: [players[12].id, players[13].id],
      tier: 'EXPLORERS',
    },
    // Round 2: T1vT3, T2vT4
    {
      courtIndex: 0,
      round: 2,
      teamA: [players[0].id, players[1].id],
      teamB: [players[4].id, players[5].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 1,
      round: 2,
      teamA: [players[2].id, players[3].id],
      teamB: [players[6].id, players[7].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 2,
      round: 2,
      teamA: [players[8].id, players[9].id],
      teamB: [players[12].id, players[13].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 2,
      teamA: [players[10].id, players[11].id],
      teamB: [players[14].id, players[15].id],
      tier: 'EXPLORERS',
    },
    // Round 3: T1vT2, T3vT4
    {
      courtIndex: 0,
      round: 3,
      teamA: [players[0].id, players[1].id],
      teamB: [players[2].id, players[3].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 1,
      round: 3,
      teamA: [players[4].id, players[5].id],
      teamB: [players[6].id, players[7].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 2,
      round: 3,
      teamA: [players[8].id, players[9].id],
      teamB: [players[10].id, players[11].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 3,
      teamA: [players[12].id, players[13].id],
      teamB: [players[14].id, players[15].id],
      tier: 'EXPLORERS',
    },
  ];

  for (const assignment of pastAssignments) {
    await prisma.assignment.create({
      data: {
        drawId: pastDraw.id,
        courtId: courts[assignment.courtIndex].id,
        round: assignment.round,
        teamA: assignment.teamA,
        teamB: assignment.teamB,
        tier: assignment.tier,
      },
    });
  }

  console.log(
    `✅ Created: ${pastPublished.title} (${pastPublished.state}) - 2 weeks ago, with draw`
  );

  // ========================================
  // 2. Recent Event - PUBLISHED (last week, completed)
  // ========================================
  const lastWeekPublished = await createEvent('Sunday Session - Mar 23', -7, EventState.PUBLISHED);

  // Add 12 RSVPs
  for (let i = 0; i < 12; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: lastWeekPublished.id,
        playerId: players[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  // Create a draw for this event
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

  // Create assignments (12 players: 4 MASTERS + 8 EXPLORERS)
  // MASTERS: 2 teams on 1 court → 1 round
  // EXPLORERS: 4 teams on 2 courts → 3 rounds
  const lastWeekAssignments = [
    // MASTERS Round 1 (2 teams → 1 match only)
    {
      courtIndex: 0,
      round: 1,
      teamA: [players[0].id, players[1].id],
      teamB: [players[2].id, players[3].id],
      tier: 'MASTERS',
    },
    // EXPLORERS Round 1: T1vT4, T2vT3
    {
      courtIndex: 2,
      round: 1,
      teamA: [players[4].id, players[5].id],
      teamB: [players[10].id, players[11].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 1,
      teamA: [players[6].id, players[7].id],
      teamB: [players[8].id, players[9].id],
      tier: 'EXPLORERS',
    },
    // EXPLORERS Round 2: T1vT3, T2vT4
    {
      courtIndex: 2,
      round: 2,
      teamA: [players[4].id, players[5].id],
      teamB: [players[8].id, players[9].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 2,
      teamA: [players[6].id, players[7].id],
      teamB: [players[10].id, players[11].id],
      tier: 'EXPLORERS',
    },
    // EXPLORERS Round 3: T1vT2, T3vT4
    {
      courtIndex: 2,
      round: 3,
      teamA: [players[4].id, players[5].id],
      teamB: [players[6].id, players[7].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 3,
      teamA: [players[8].id, players[9].id],
      teamB: [players[10].id, players[11].id],
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
    `✅ Created: ${lastWeekPublished.title} (${lastWeekPublished.state}) - last week, 12 players with draw`
  );

  // ========================================
  // 3. Next Week - DRAWN (draw created but not yet published)
  // ========================================
  const thisWeekDrawn = await createEvent('Sunday Session - Apr 6', 7, EventState.DRAWN);

  // Add 16 RSVPs
  for (const player of players) {
    await prisma.rSVP.create({
      data: {
        eventId: thisWeekDrawn.id,
        playerId: player.id,
        status: 'CONFIRMED',
      },
    });
  }

  // Create unpublished draw
  const thisWeekDraw = await prisma.draw.create({
    data: {
      eventId: thisWeekDrawn.id,
      createdBy: players[0].userId,
      constraintsJson: {
        avoidRecentSessions: 4,
        balanceStrength: true,
      },
    },
  });

  // Create assignments for the draw (16 players, 4 courts, 3 rounds — same structure as Feb 16)
  const thisWeekAssignments = [
    // Round 1: T1vT4, T2vT3
    {
      courtIndex: 0,
      round: 1,
      teamA: [players[0].id, players[1].id],
      teamB: [players[6].id, players[7].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 1,
      round: 1,
      teamA: [players[2].id, players[3].id],
      teamB: [players[4].id, players[5].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 2,
      round: 1,
      teamA: [players[8].id, players[9].id],
      teamB: [players[14].id, players[15].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 1,
      teamA: [players[10].id, players[11].id],
      teamB: [players[12].id, players[13].id],
      tier: 'EXPLORERS',
    },
    // Round 2: T1vT3, T2vT4
    {
      courtIndex: 0,
      round: 2,
      teamA: [players[0].id, players[1].id],
      teamB: [players[4].id, players[5].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 1,
      round: 2,
      teamA: [players[2].id, players[3].id],
      teamB: [players[6].id, players[7].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 2,
      round: 2,
      teamA: [players[8].id, players[9].id],
      teamB: [players[12].id, players[13].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 2,
      teamA: [players[10].id, players[11].id],
      teamB: [players[14].id, players[15].id],
      tier: 'EXPLORERS',
    },
    // Round 3: T1vT2, T3vT4
    {
      courtIndex: 0,
      round: 3,
      teamA: [players[0].id, players[1].id],
      teamB: [players[2].id, players[3].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 1,
      round: 3,
      teamA: [players[4].id, players[5].id],
      teamB: [players[6].id, players[7].id],
      tier: 'MASTERS',
    },
    {
      courtIndex: 2,
      round: 3,
      teamA: [players[8].id, players[9].id],
      teamB: [players[10].id, players[11].id],
      tier: 'EXPLORERS',
    },
    {
      courtIndex: 3,
      round: 3,
      teamA: [players[12].id, players[13].id],
      teamB: [players[14].id, players[15].id],
      tier: 'EXPLORERS',
    },
  ];

  for (const assignment of thisWeekAssignments) {
    await prisma.assignment.create({
      data: {
        drawId: thisWeekDraw.id,
        courtId: courts[assignment.courtIndex].id,
        round: assignment.round,
        teamA: assignment.teamA,
        teamB: assignment.teamB,
        tier: assignment.tier,
      },
    });
  }

  console.log(
    `✅ Created: ${thisWeekDrawn.title} (${thisWeekDrawn.state}) - draw ready, not published yet`
  );

  // ========================================
  // 4. Two Weeks Out - FROZEN (RSVPs closed, ready for draw)
  // ========================================
  const nextWeekFrozen = await createEvent('Sunday Session - Apr 13', 14, EventState.FROZEN);

  // Add exactly 8 RSVPs (smaller event)
  for (let i = 0; i < 8; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: nextWeekFrozen.id,
        playerId: players[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(
    `✅ Created: ${nextWeekFrozen.title} (${nextWeekFrozen.state}) - ready for draw generation, 8 players`
  );

  // ========================================
  // 5. Three Weeks Out - OPEN (accepting RSVPs, some players already signed up)
  // ========================================
  const weekAfterOpen = await createEvent('Sunday Session - Apr 20', 21, EventState.OPEN);

  // Add 5 RSVPs (event is filling up)
  for (let i = 0; i < 5; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: weekAfterOpen.id,
        playerId: players[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(
    `✅ Created: ${weekAfterOpen.title} (${weekAfterOpen.state}) - accepting RSVPs, 5/16 spots filled`
  );

  // ========================================
  // 6. Four Weeks Out - OPEN (just opened for RSVP)
  // ========================================
  const threeWeeksOpen = await createEvent('Sunday Session - Apr 27', 28, EventState.OPEN);

  // Add 2 early RSVPs
  for (let i = 0; i < 2; i++) {
    await prisma.rSVP.create({
      data: {
        eventId: threeWeeksOpen.id,
        playerId: players[i].id,
        status: 'CONFIRMED',
      },
    });
  }

  console.log(
    `✅ Created: ${threeWeeksOpen.title} (${threeWeeksOpen.state}) - just opened, 2 early birds`
  );

  // ========================================
  // 7. Five Weeks Out - OPEN (empty, waiting for RSVPs)
  // ========================================
  const fourWeeksOpen = await createEvent('Sunday Session - May 4', 35, EventState.OPEN);
  console.log(`✅ Created: ${fourWeeksOpen.title} (${fourWeeksOpen.state}) - no RSVPs yet`);

  // ========================================
  // 8. Far Future - DRAFT (not published yet, being planned)
  // ========================================
  const farFutureDraft = await createEvent('Sunday Session - May 11', 42, EventState.DRAFT);
  console.log(`✅ Created: ${farFutureDraft.title} (${farFutureDraft.state}) - still in planning`);

  // ========================================
  // 9. Very Far Future - DRAFT (long-term planning)
  // ========================================
  const veryFarDraft = await createEvent('Sunday Session - May 18', 49, EventState.DRAFT);
  console.log(`✅ Created: ${veryFarDraft.title} (${veryFarDraft.state}) - future planning`);

  console.log('\n🎉 Test events created successfully!');
  console.log('\n📋 Event States Summary:');
  console.log('  • DRAFT: Event created but not published yet');
  console.log('  • OPEN: Published and accepting RSVPs');
  console.log('  • FROZEN: RSVPs closed, ready for draw generation');
  console.log('  • DRAWN: Draw created but not yet published to players');
  console.log('  • PUBLISHED: Draw published, event completed');
  console.log('\n🗓️  Events Created:');
  console.log('  Past:');
  console.log('    1. Feb 16 (2 weeks ago) - PUBLISHED with full draw');
  console.log('    2. Mar 23 (last week) - PUBLISHED, 12 players');
  console.log('  Future:');
  console.log('    3. Apr 6 (next week) - DRAWN (draw ready, not published)');
  console.log('    4. Apr 13 (2 weeks) - FROZEN, 8 players, ready for draw');
  console.log('    5. Apr 20 (3 weeks) - OPEN, 5/16 spots filled');
  console.log('    6. Apr 27 (4 weeks) - OPEN, 2/16 spots filled');
  console.log('    7. May 4 (5 weeks) - OPEN, empty');
  console.log('    8. May 11 (6 weeks) - DRAFT, planning phase');
  console.log('    9. May 18 (7 weeks) - DRAFT, planning phase');
  console.log('\n💡 Testing Scenarios:');
  console.log('  ✓ Historical events with completed draws');
  console.log('  ✓ Event with draw ready to publish (DRAWN state)');
  console.log('  ✓ Event ready for draw generation (FROZEN)');
  console.log('  ✓ Events at various RSVP stages (empty, partial, ready)');
  console.log('  ✓ Draft events for planning future sessions');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
