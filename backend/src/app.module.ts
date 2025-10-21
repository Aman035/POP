import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MarketsModule } from './markets/markets.module';
import { DatabaseModule } from './database/database.module';
import { TweetAnalyzerModule } from './tweet-analyzer/tweet-analyzer.module';

@Module({
  imports: [DatabaseModule, HealthModule, MarketsModule, TweetAnalyzerModule],
})
export class AppModule {}
