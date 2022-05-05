import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FeedsModule } from './feeds/feeds.module';
import { QuestsModule } from './quests/quests.module';

@Module({
  imports: [UsersModule, FeedsModule, QuestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
