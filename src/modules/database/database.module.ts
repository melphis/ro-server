import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MerchantsService } from './merchants.service';

@Module({
  providers: [DatabaseService, MerchantsService],
  exports: [DatabaseService, MerchantsService],
})
export class DatabaseModule {}
