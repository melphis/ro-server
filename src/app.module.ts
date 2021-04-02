import { Module } from '@nestjs/common';
import { ApiModule } from './modules/api/api.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [ApiModule, DatabaseModule],
  providers: [],
})
export class AppModule {}
