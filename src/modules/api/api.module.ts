import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { CrawlerModule } from '../crawler/crawler.module';

@Module({
  providers: [EventsGateway],
  imports: [CrawlerModule],
})
export class ApiModule {}
