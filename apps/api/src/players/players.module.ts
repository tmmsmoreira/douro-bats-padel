import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { InactivityService } from './inactivity.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlayersController],
  providers: [PlayersService, InactivityService],
  exports: [PlayersService, InactivityService],
})
export class PlayersModule {}
