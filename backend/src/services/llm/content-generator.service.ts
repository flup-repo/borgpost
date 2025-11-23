import { Injectable, Logger } from '@nestjs/common';
import { LlmService } from './llm.service';
import { Category } from '../../modules/categories/categories.entity';
import { Prompt } from '../../modules/prompts/prompts.entity';

@Injectable()
export class ContentGeneratorService {
  private readonly logger = new Logger(ContentGeneratorService.name);

  constructor(private readonly llmService: LlmService) {}

  async generatePost(category: Category, prompt: Prompt, context?: string): Promise<string> {
    const fullPrompt = this.buildPrompt(prompt.content, context);
    this.logger.log(`Generating content for category ${category.name} with prompt ${prompt.name}`);
    return this.llmService.generate(fullPrompt);
  }

  private buildPrompt(template: string, context?: string): string {
    let p = template.replace('{date}', new Date().toISOString());
    if (context) {
      p = p.replace('{context}', context);
    }
    // Fallback if {context} not in prompt but context provided?
    // For now strict replacement.
    return p;
  }
}
