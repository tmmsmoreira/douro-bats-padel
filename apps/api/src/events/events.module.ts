import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RSVPService } from './rsvp.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../notifications/email.service';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  controllers: [EventsController],
  providers: [EventsService, RSVPService, NotificationService, EmailService],
  exports: [EventsService, RSVPService],
})
export class EventsModule {}
