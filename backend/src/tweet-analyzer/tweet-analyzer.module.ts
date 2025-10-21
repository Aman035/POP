import { Module } from '@nestjs/common';
import { TweetAnalyzerController } from './tweet-analyzer.controller';
import { TweetAnalyzerService } from './tweet-analyzer.service';

@Module({
  controllers: [TweetAnalyzerController],
  providers: [TweetAnalyzerService],
  exports: [TweetAnalyzerService],
})
export class TweetAnalyzerModule {}

