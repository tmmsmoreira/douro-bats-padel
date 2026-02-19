import { Module } from '@nestjs/common';
import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../notifications/email.service';

@Module({
  controllers: [DrawController],
  providers: [DrawService, NotificationService, EmailService],
  exports: [DrawService],
})
export class DrawModule {}
