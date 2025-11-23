import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';

@Injectable()
export class RssService {
  private readonly logger = new Logger(RssService.name);
  private readonly parser = new Parser();

  async parse(url: string) {
    try {
      const feed = await this.parser.parseURL(url);
      return feed;
    } catch (error) {
      this.logger.error(`Failed to parse RSS feed: ${url}`, error);
      throw error;
    }
  }
}
