import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TweetAnalyzerModule } from './tweet-analyzer/tweet-analyzer.module';

@Module({
  imports: [HealthModule, TweetAnalyzerModule],
})
export class AppModule {}
