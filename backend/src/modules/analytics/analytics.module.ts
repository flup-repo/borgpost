import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostMetric } from './post-metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostMetric])],
  exports: [TypeOrmModule]
})
export class AnalyticsModule {}
