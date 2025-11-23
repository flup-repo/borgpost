import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TwitterService } from '../services/twitter/twitter.service';
import { PostsService } from '../modules/posts/posts.service';
import { PostStatus } from '../modules/posts/posts.entity';
import { ContentGeneratorService } from '../services/llm/content-generator.service';

@Processor('post-executor')
export class PostExecutorProcessor {
  private readonly logger = new Logger(PostExecutorProcessor.name);

  constructor(
    private readonly twitterService: TwitterService,
    private readonly postsService: PostsService,
    private readonly contentGenerator: ContentGeneratorService,
  ) {}

  @Process('execute-post')
  async handlePostExecution(job: Job<{ postId: number }>) {
    this.logger.log(`Processing job ${job.id} for Post ID: ${job.data.postId}`);
    const post = await this.postsService.findOne(job.data.postId);
    
    if (!post) {
        this.logger.error(`Post not found for ID: ${job.data.postId}`);
        return;
    }

    this.logger.log(`Current post status: ${post.status}`);
    
    if (post.status !== PostStatus.SCHEDULED && post.status !== PostStatus.WAITING_GENERATION) {
        this.logger.warn(`Post ${post.id} is not in SCHEDULED or WAITING_GENERATION state. Current status: ${post.status}`);
        return;
    }

    try {
      // Just-In-Time Generation Logic
      if (post.status === PostStatus.WAITING_GENERATION) {
        this.logger.log(`Generating content for post ${post.id} (Just-In-Time)...`);
        
        if (!post.category) {
          throw new Error('Category is missing for WAITING_GENERATION post');
        }
        if (!post.prompt) {
          throw new Error('Prompt is missing for WAITING_GENERATION post');
        }

        const content = await this.contentGenerator.generatePost(post.category, post.prompt);
        
        // Update post with generated content
        post.content = content;
        await this.postsService.update(post.id, {
          content,
          status: PostStatus.SCHEDULED, // Temporarily update status before posting
        });
        
        this.logger.log(`Content generated for post ${post.id}: "${content.substring(0, 30)}..."`);
      }

      const result = await this.twitterService.postTweet(post.content);
      
      await this.postsService.update(post.id, {
        status: PostStatus.POSTED,
        postedTime: new Date(),
        externalId: result.data.id,
      });
      this.logger.log(`Post ${post.id} successfully published to Twitter`);
    } catch (error) {
        this.logger.error(`Failed to process post ${post.id}`, error);
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
