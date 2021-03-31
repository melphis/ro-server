import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiModule } from './modules/api/api.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [ApiModule, DatabaseModule],
  providers: [AppService],
})
export class AppModule {}
