import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotifsController } from './notifs.controller';
import { NotifsService } from './notifs.service';
import { Notif } from './entities/notif.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notif])],
  controllers: [NotifsController],
  providers: [NotifsService],
})
export class NotifsModule {}
