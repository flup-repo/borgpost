import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TwitterService {
  private readonly logger = new Logger(TwitterService.name);
  private client: TwitterApi;

  constructor(private configService: ConfigService) {
    const appKey = this.configService.get<string>('TWITTER_API_KEY');
    const appSecret = this.configService.get<string>('TWITTER_API_SECRET');
    const accessToken = this.configService.get<string>('TWITTER_ACCESS_TOKEN');
    const accessSecret = this.configService.get<string>('TWITTER_ACCESS_SECRET');

    if (appKey && appSecret && accessToken && accessSecret && appKey !== 'your_twitter_api_key') {
      this.client = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret,
      });
    } else {
      this.logger.warn('Twitter credentials missing or invalid in configuration');
    }
  }

  async postTweet(content: string): Promise<any> {
    if (!this.client) {
        throw new Error('Twitter client not initialized');
    }
    try {
      return await this.client.v2.tweet(content);
    } catch (error) {
      this.logger.error('Failed to post tweet', error);
      throw error;
    }
  }
}
