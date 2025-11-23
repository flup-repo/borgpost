import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleSlot } from './schedule-slot.entity';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ScheduleCronService } from './schedule.cron';
import { Post } from '../posts/posts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScheduleSlot, Post]),
    BullModule.registerQueue(
      { name: 'post-executor' },
      { name: 'auto-fill' }
    ),
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleCronService],
  exports: [TypeOrmModule, ScheduleService]
})
export class ScheduleModule {}
