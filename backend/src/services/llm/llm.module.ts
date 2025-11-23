import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { ContentGeneratorService } from './content-generator.service';

@Module({
  providers: [LlmService, ContentGeneratorService],
  exports: [LlmService, ContentGeneratorService],
})
export class LlmModule {}
