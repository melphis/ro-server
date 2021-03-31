import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiModule } from './modules/api/api.module';
import { CrawlerService } from './services/crawler.service';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [ApiModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, CrawlerService],
})
export class AppModule {}
