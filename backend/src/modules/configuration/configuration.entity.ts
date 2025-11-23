import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('configurations')
export class Configuration {
  @PrimaryColumn({ name: 'config_key', length: 100 })
  key: string;

  @Column({ name: 'config_value', type: 'text' })
  value: string;

  @Column({ default: false })
  encrypted: boolean;

  @Column({ length: 500, nullable: true })
  description: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
