import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn('GEMINI_API_KEY not set or invalid');
    } else {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: this.configService.get('GEMINI_MODEL_PRIMARY') || 'gemini-1.5-pro' });
    }
  }

  async generate(prompt: string): Promise<string> {
    if (!this.model) {
        throw new Error('LLM model not initialized');
    }
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('LLM generation failed', error);
      throw error;
    }
  }
}
