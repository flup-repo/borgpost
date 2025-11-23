import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PostExecutorProcessor } from './post-executor.processor';
import { PostsModule } from '../modules/posts/posts.module';
import { ScheduleModule } from '../modules/schedule/schedule.module';
import { LlmModule } from '../services/llm/llm.module';
import { TwitterModule } from '../services/twitter/twitter.module';
import { PromptsModule } from '../modules/prompts/prompts.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'post-executor' }
    ),
    PostsModule,
    ScheduleModule,
    LlmModule,
    TwitterModule,
    PromptsModule
  ],
  providers: [PostExecutorProcessor],
})
export class JobsModule {}
