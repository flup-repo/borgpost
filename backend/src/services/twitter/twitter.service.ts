import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TwitterService implements OnModuleInit {
  private readonly logger = new Logger(TwitterService.name);
  private client: TwitterApi;
  private rwClient: any; // Use 'any' or specific interface if available to avoid type mismatch

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
      
      // Ensure we are using the read-write client for v2 operations
      this.rwClient = this.client.readWrite;
    } else {
      this.logger.warn('Twitter credentials missing or invalid in configuration');
      this.logger.debug(`Debug: appKey exists: ${!!appKey}, appSecret exists: ${!!appSecret}, accessToken exists: ${!!accessToken}, accessSecret exists: ${!!accessSecret}`);
      if (appKey === 'your_twitter_api_key') {
        this.logger.warn('Twitter API Key is set to default placeholder "your_twitter_api_key"');
      }
    }
  }

  async onModuleInit() {
    if (this.rwClient) {
      try {
        const currentUser = await this.rwClient.v2.me();
        this.logger.log(`Twitter connection established. Logged in as: ${currentUser.data.username}`);
      } catch (error) {
        this.logger.error(`Failed to verify Twitter credentials on startup: ${error.message}`, error);
      }
    }
  }

  async postTweet(content: string): Promise<any> {
    if (!this.rwClient) {
        this.logger.error('Twitter client not initialized - rwClient is null');
        throw new Error('Twitter client not initialized');
    }
    
    // Sanitize content
    let sanitizedContent = content ? content.trim() : '';
    
    // Check length and truncate if necessary (standard Twitter limit is 280)
    // Note: This is a naive character count. URLs count as 23 chars. Emojis count differently.
    // For safety on Free Tier, we hard limit to 280.
    if (sanitizedContent.length > 280) {
        this.logger.warn(`Content length (${sanitizedContent.length}) exceeds 280 characters. Truncating.`);
        // Try to truncate cleanly at the last space before 277 chars + "..."
        const truncated = sanitizedContent.substring(0, 277);
        const lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace > 0) {
            sanitizedContent = truncated.substring(0, lastSpace) + '...';
        } else {
             sanitizedContent = truncated + '...';
        }
    }
    
    this.logger.log(`[TwitterService] Preparing to post. Length: ${sanitizedContent.length}`);
    this.logger.log(`[TwitterService] Content Preview: "${sanitizedContent.substring(0, 50)}..."`);

    if (!sanitizedContent) {
      throw new Error('Cannot post empty content to Twitter');
    }

    try {
      // Explicitly construct the payload to avoid any extra properties
      return await this.rwClient.v2.tweet(sanitizedContent);
    } catch (error) {
      if (error.code === 403) {
        this.logger.error(`403 Forbidden Details:`);
        this.logger.error(`  Message: ${error.message}`);
        // Check if we have data to log
        if (error.data) {
           this.logger.error(`  Body: ${JSON.stringify(error.data)}`);
        }
      }
      
      if (error.code === 403 && error.data?.detail?.includes('oauth1 app permissions')) {
        this.logger.error(
          'Twitter API Permission Error: Your Access Token has Read-Only permissions. ' +
          'Please go to the Twitter Developer Portal, ensuring "Read and Write" permissions are selected in "User authentication settings", ' +
          'and REGENERATE your Access Token and Secret. Updating the settings alone is NOT enough; you must generate new tokens.'
        );
      }
      this.logger.error('Failed to post tweet', error);
      throw error;
    }
  }
}
