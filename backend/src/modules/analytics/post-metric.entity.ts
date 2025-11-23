import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Post } from '../posts/posts.entity';

@Entity('post_metrics')
export class PostMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'bigint' })
  postId: number;

  @OneToOne(() => Post, post => post.metrics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  retweets: number;

  @Column({ default: 0 })
  replies: number;

  @Column({ default: 0 })
  impressions: number;

  @CreateDateColumn({ name: 'synced_at' })
  syncedAt: Date;
}
