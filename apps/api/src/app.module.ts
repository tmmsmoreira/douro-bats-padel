import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { PrismaModule } from "./prisma/prisma.module"
import { AuthModule } from "./auth/auth.module"
import { EventsModule } from "./events/events.module"
import { RankingModule } from "./ranking/ranking.module"
import { DrawModule } from "./draw/draw.module"
import { MatchesModule } from "./matches/matches.module"
import { VenuesModule } from "./venues/venues.module"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    EventsModule,
    VenuesModule,
    RankingModule,
    DrawModule,
    MatchesModule,
  ],
})
export class AppModule {}
