import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Post } from '../posts/posts.entity';
import { Prompt } from '../prompts/prompts.entity';
import { ScheduleSlot } from '../schedule/schedule-slot.entity';
import { RssFeed } from './rss-feed.entity';
import { SourceContent } from './source-content.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 1 })
  priority: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Post, post => post.category)
  posts: Post[];

  @OneToMany(() => Prompt, prompt => prompt.category)
  prompts: Prompt[];

  @OneToMany(() => ScheduleSlot, slot => slot.category)
  scheduleSlots: ScheduleSlot[];

  @OneToMany(() => RssFeed, feed => feed.category)
  rssFeeds: RssFeed[];

  @OneToMany(() => SourceContent, content => content.category)
  sourceContents: SourceContent[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
