import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  providers: [CrawlerService],
  exports: [CrawlerService],
  imports: [DatabaseModule],
})
export class CrawlerModule {}
