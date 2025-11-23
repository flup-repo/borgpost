import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between } from 'typeorm';
import { Post, PostStatus } from '../posts/posts.entity';
import { ScheduleSlot } from './schedule-slot.entity';
import { PromptsService } from '../prompts/prompts.service';

@Injectable()
export class ScheduleCronService {
  private readonly logger = new Logger(ScheduleCronService.name);

  constructor(
    @InjectQueue('post-executor') private readonly postExecutorQueue: Queue,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(ScheduleSlot) private readonly slotRepository: Repository<ScheduleSlot>,
    private readonly promptsService: PromptsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    this.logger.debug('Checking for scheduled slots...');
    const now = new Date();
    
    // 1. Process manually scheduled posts (existing logic, just in case)
    const manualPosts = await this.postRepository.find({
      where: [
        { status: PostStatus.SCHEDULED, scheduledTime: LessThanOrEqual(now) },
        { status: PostStatus.WAITING_GENERATION, scheduledTime: LessThanOrEqual(now) }
      ],
      take: 10,
    });

    if (manualPosts.length > 0) {
      this.logger.log(`Found ${manualPosts.length} manual posts to publish`);
      for (const post of manualPosts) {
        await this.postExecutorQueue.add('execute-post', { postId: post.id });
      }
    }

    // 2. Check for active slots matching current time
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday...
    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const todayName = dayMap[currentDay];

    // Format current time as HH:MM
    // Since DB slots seem to be stored in local time (e.g., 18:28), and system logs show 18:28, 
    // but now.getUTCHours() returns 16:28, we have a mismatch.
    // We should probably use local time if the app is running with system timezone, 
    // OR assume slots are stored in UTC.
    // Given the user says "I scheduled at 16:28", and logs show "6:28 PM", it implies user is in UTC+2.
    // And DB has "18:28".
    // If user meant 16:28 UTC, DB should have 16:28 if we respect UTC.
    // If the slot creation UI sends local time, then we have a problem.
    // Let's switch to using the same timezone as the system for now to match DB.
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeString = `${hours}:${minutes}`;

    // Ideally we'd query the DB for time matching, but TypeORM time column handling can be tricky across DBs.
    // For safety, we can fetch all active slots for today and filter in memory, or try a specific query.
    // Let's try a query for active slots first.
    const slots = await this.slotRepository.find({
        where: { active: true }
    });

    const matchingSlots = slots.filter(slot => {
        // Check time match (assuming UTC for now as per implementation plan)
        // Note: slot.time format depends on DB driver. SQLite might return "HH:MM:SS" or "HH:MM"
        // DB contains "18:10" etc. but logic compares against UTC time.
        // If the user created slots in their local time (EEST +2/3), then 18:28 is local, which is 16:28 UTC.
        // The DB shows "18:28". The code gets UTC "16:28".
        // If the slot time is intended to be the "wall clock time" when it should fire, we need to align comparisons.
        // The user said "I scheduled one at 16:28 [UTC presumably]... and nothing happened".
        // The logs show queries at "6:28:00 PM" (18:28) local system time.
        // The DB slots are '18:28'.
        // Code calculates `currentTimeString` from UTC. "18:28" local is "16:28" UTC.
        // So currentTimeString is "16:28". slot.time is "18:28". No match.
        
        // Debug log for troubleshooting
        // this.logger.debug(`Checking slot ${slot.id}: DB Time=${slot.time}, Current UTC=${currentTimeString}`);

        const slotTime = slot.time.substring(0, 5); // "18:10"
        
        if (slotTime !== currentTimeString) return false;
        
        // Check day match
        const slotDays = slot.daysOfWeek.split(',').map(d => d.trim().toUpperCase());
        return slotDays.includes(todayName) || slotDays.includes('DAILY');
    });

    if (matchingSlots.length > 0) {
        this.logger.log(`Found ${matchingSlots.length} matching slots for ${currentTimeString} on ${todayName}`);
        
        for (const slot of matchingSlots) {
             await this.processSlot(slot, now);
        }
    }
  }

  private async processSlot(slot: ScheduleSlot, scheduledTime: Date) {
      // Idempotency Check: Did we already create a post for this slot today?
      const startOfDay = new Date(scheduledTime);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      const endOfDay = new Date(scheduledTime);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const existingPost = await this.postRepository.findOne({
          where: {
              slotId: slot.id,
              createdAt: Between(startOfDay, endOfDay)
          }
      });

      if (existingPost) {
          this.logger.debug(`Slot ${slot.id} already processed for today. Skipping.`);
          return;
      }

      // Create the Post entity (Waiting Generation)
      this.logger.log(`Initializing generation for Slot ${slot.id}`);
      
      if (!slot.categoryId) {
          this.logger.warn(`Slot ${slot.id} has no category. Skipping.`);
          return;
      }

      const prompts = await this.promptsService.findAll(slot.categoryId);
      if (!prompts.length) {
          this.logger.warn(`No prompts found for category ${slot.categoryId}. Skipping.`);
          return;
      }
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      const newPost = this.postRepository.create({
          content: null as unknown as string, // Forced cast to satisfy TypeORM typing if strict
          status: PostStatus.WAITING_GENERATION,
          scheduledTime: scheduledTime,
          categoryId: slot.categoryId,
          promptId: randomPrompt.id,
          slotId: slot.id
      });

      const savedPost = await this.postRepository.save(newPost);
      
      // Trigger immediate execution
      await this.postExecutorQueue.add('execute-post', { postId: savedPost.id });
  }
}
