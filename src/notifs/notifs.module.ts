import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifsController } from './notifs.controller';
import { NotifsService } from './notifs.service';
import { Notif } from './entities/notif.entity';
import { Region } from '../quests/entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notif, Region])],
  controllers: [NotifsController],
  providers: [NotifsService],
})
export class NotifsModule {}
