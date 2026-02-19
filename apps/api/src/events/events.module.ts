import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RSVPService } from './rsvp.service';
import { NotificationService } from '../notifications/notification.service';
import { EmailService } from '../notifications/email.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, RSVPService, NotificationService, EmailService],
  exports: [EventsService, RSVPService],
})
export class EventsModule {}
