import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/categories.entity';

@Entity('schedule_slots')
export class ScheduleSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time' })
  time: string;

  @Column({ name: 'days_of_week', length: 20 })
  daysOfWeek: string;

  @Column({ name: 'category_id', type: 'bigint', nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, category => category.scheduleSlots, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ length: 50, default: 'UTC' })
  timezone: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
