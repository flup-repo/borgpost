import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './categories.entity';

@Entity('rss_feeds')
export class RssFeed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: number;

  @ManyToOne(() => Category, category => category.rssFeeds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 1000 })
  url: string;

  @Column({ name: 'last_fetched', type: 'datetime', nullable: true })
  lastFetched: Date;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
