import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../notifications/email.service';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  controllers: [RankingController],
  providers: [RankingService, NotificationService, EmailService],
  exports: [RankingService],
})
export class RankingModule {}
