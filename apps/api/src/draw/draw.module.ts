import { Module } from "@nestjs/common"
import { DrawController } from "./draw.controller"
import { DrawService } from "./draw.service"
import { NotificationService } from "../notifications/notification.service"

@Module({
  controllers: [DrawController],
  providers: [DrawService, NotificationService],
  exports: [DrawService],
})
export class DrawModule {}
