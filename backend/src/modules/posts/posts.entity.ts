import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Category } from '../categories/categories.entity';
import { Prompt } from '../prompts/prompts.entity';
import { ScheduleSlot } from '../schedule/schedule-slot.entity';
import { PostMetric } from '../analytics/post-metric.entity';

export enum PostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  WAITING_GENERATION = 'WAITING_GENERATION',
  POSTED = 'POSTED',
  FAILED = 'FAILED',
  APPROVED = 'APPROVED'
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 20 })
  status: PostStatus;

  @Column({ type: 'datetime', nullable: true, name: 'scheduled_time' })
  scheduledTime: Date;

  @Column({ type: 'datetime', nullable: true, name: 'posted_time' })
  postedTime: Date;

  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, category => category.posts, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'prompt_id', type: 'bigint', nullable: true })
  promptId: number;

  @ManyToOne(() => Prompt, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'prompt_id' })
  prompt: Prompt;

  @Column({ name: 'slot_id', type: 'bigint', nullable: true })
  slotId: number;

  @ManyToOne(() => ScheduleSlot, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'slot_id' })
  slot: ScheduleSlot;

  @Column({ name: 'parent_post_id', type: 'bigint', nullable: true })
  parentPostId: number;

  @ManyToOne(() => Post, post => post.childPosts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_post_id' })
  parentPost: Post;

  @OneToMany(() => Post, post => post.parentPost)
  childPosts: Post[];

  @Column({ name: 'thread_position', default: 0 })
  threadPosition: number;

  @Column({ name: 'external_id', length: 50, nullable: true })
  externalId: string;

  @Column({ name: 'media_url', length: 500, nullable: true })
  mediaUrl: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @OneToOne(() => PostMetric, metric => metric.post)
  metrics: PostMetric;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
