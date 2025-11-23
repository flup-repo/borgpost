import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Post, PostStatus } from '../posts/posts.entity';
import { ScheduleService } from './schedule.service';

@Injectable()
export class ScheduleCronService {
  private readonly logger = new Logger(ScheduleCronService.name);

  constructor(
    @InjectQueue('post-executor') private readonly postExecutorQueue: Queue,
    @InjectQueue('auto-fill') private readonly autoFillQueue: Queue,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    this.logger.debug('Checking for scheduled posts...');
    const now = new Date();
    
    // Find posts that are scheduled for now or in the past, and are still 'SCHEDULED'
    const postsToPublish = await this.postRepository.find({
      where: {
        status: PostStatus.SCHEDULED,
        scheduledTime: LessThanOrEqual(now),
      },
      take: 10, // Batch size
    });

    if (postsToPublish.length > 0) {
      this.logger.log(`Found ${postsToPublish.length} posts to publish`);
      for (const post of postsToPublish) {
        await this.postExecutorQueue.add('execute-post', { postId: post.id });
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async triggerAutoFill() {
    this.logger.debug('Triggering auto-fill check...');
    await this.autoFillQueue.add('check-and-fill', {});
  }
}
