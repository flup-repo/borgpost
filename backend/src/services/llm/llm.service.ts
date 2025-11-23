import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private fallbackModel: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn('GEMINI_API_KEY not set or invalid');
    } else {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: this.configService.get('GEMINI_MODEL_PRIMARY') || 'gemini-2.5-pro' });
        this.fallbackModel = this.genAI.getGenerativeModel({ model: this.configService.get('GEMINI_MODEL_FALLBACK') || 'gemini-2.5-flash' });
    }
  }

  async generate(prompt: string): Promise<string> {
    if (!this.model) {
        throw new Error('LLM model not initialized');
    }

    let lastError: any;
    const maxRetries = 5;
    const retryDelay = 30000; // 30 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await this.tryGenerate(prompt);
        } catch (error) {
            lastError = error;
            this.logger.error(`LLM generation attempt ${attempt}/${maxRetries} failed: ${error.message}`);
            
            if (attempt < maxRetries) {
                this.logger.log(`Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }

    this.logger.error('All retry attempts failed');
    throw lastError;
  }

  private async tryGenerate(prompt: string): Promise<string> {
    try {
      this.logger.log(`Generating content using primary model: ${this.configService.get('GEMINI_MODEL_PRIMARY') || 'gemini-2.5-pro'}`);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.warn(`Primary model failed: ${error.message}. Trying fallback model...`);
      try {
          this.logger.log(`Generating content using fallback model: ${this.configService.get('GEMINI_MODEL_FALLBACK') || 'gemini-2.5-flash'}`);
          const result = await this.fallbackModel.generateContent(prompt);
          const response = await result.response;
          return response.text();
      } catch (fallbackError) {
          this.logger.error('LLM generation failed on both primary and fallback models', fallbackError);
          throw fallbackError;
      }
    }
  }
}
