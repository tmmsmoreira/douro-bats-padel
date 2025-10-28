import { Module } from "@nestjs/common"
import { RankingController } from "./ranking.controller"
import { RankingService } from "./ranking.service"
import { NotificationService } from "../notifications/notification.service"

@Module({
  controllers: [RankingController],
  providers: [RankingService, NotificationService],
  exports: [RankingService],
})
export class RankingModule {}
