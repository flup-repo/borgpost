import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './categories.entity';

@Entity('source_content')
export class SourceContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: number;

  @ManyToOne(() => Category, category => category.sourceContents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 1000 })
  url: string;

  @Column({ length: 500, nullable: true })
  title: string;

  @Column('text', { nullable: true })
  summary: string;

  @Column('text', { nullable: true, name: 'raw_content' })
  rawContent: string;

  @Column({ name: 'published_date', type: 'datetime', nullable: true })
  publishedDate: Date;

  @CreateDateColumn({ name: 'fetched_at' })
  fetchedAt: Date;

  @Column({ name: 'used_count', default: 0 })
  usedCount: number;
}
