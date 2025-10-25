import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { PostAnalyzerModule } from './post-analyzer/post-analyzer.module';

@Module({
  imports: [HealthModule, PostAnalyzerModule],
})
export class AppModule {}
