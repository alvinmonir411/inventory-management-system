import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'warehouses' })
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('warehouses_name_unique', { unique: true })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index('warehouses_code_unique', { unique: true })
  @Column({ type: 'varchar', length: 30, nullable: true })
  code!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Index('warehouses_is_active_idx')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
