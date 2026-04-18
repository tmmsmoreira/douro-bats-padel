import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { RankingModule } from './ranking/ranking.module';
import { DrawModule } from './draw/draw.module';
import { MatchesModule } from './matches/matches.module';
import { VenuesModule } from './venues/venues.module';
import { PlayersModule } from './players/players.module';
import { InvitationsModule } from './invitations/invitations.module';
import { PushModule } from './push/push.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PrismaModule,
    AuthModule,
    InvitationsModule,
    EventsModule,
    VenuesModule,
    PlayersModule,
    RankingModule,
    DrawModule,
    MatchesModule,
    PushModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
