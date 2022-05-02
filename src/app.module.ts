import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FeedsModule } from './feeds/feeds.module';
import { LikesController } from './likes/likes.controller';
import { LikesService } from './likes/likes.service';

@Module({
  imports: [UsersModule, FeedsModule],
  controllers: [AppController, LikesController],
  providers: [AppService, LikesService],
})
export class AppModule {}
