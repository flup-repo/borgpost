import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TwitterService } from '../services/twitter/twitter.service';
import { PostsService } from '../modules/posts/posts.service';
import { PostStatus } from '../modules/posts/posts.entity';

@Processor('post-executor')
export class PostExecutorProcessor {
  private readonly logger = new Logger(PostExecutorProcessor.name);

  constructor(
    private readonly twitterService: TwitterService,
    private readonly postsService: PostsService,
  ) {}

  @Process('execute-post')
  async handlePostExecution(job: Job<{ postId: number }>) {
    this.logger.log(`Executing post job for ID: ${job.data.postId}`);
    const post = await this.postsService.findOne(job.data.postId);
    
    if (post.status !== PostStatus.SCHEDULED) {
        this.logger.warn(`Post ${post.id} is not in SCHEDULED state. Current status: ${post.status}`);
        return;
    }

    try {
      const result = await this.twitterService.postTweet(post.content);
      
      await this.postsService.update(post.id, {
        status: PostStatus.POSTED,
        postedTime: new Date(),
        externalId: result.data.id,
      });
      this.logger.log(`Post ${post.id} successfully published to Twitter`);
    } catch (error) {
        this.logger.error(`Failed to publish post ${post.id}`, error);
        await this.postsService.update(post.id, {
            status: PostStatus.FAILED,
            errorMessage: error.message,
            retryCount: post.retryCount + 1,
        });
        // Re-queue or handle retry logic here if needed
        throw error;
    }
  }
}
