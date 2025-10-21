import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MarketsModule } from './markets/markets.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, HealthModule, MarketsModule],
})
export class AppModule {}
