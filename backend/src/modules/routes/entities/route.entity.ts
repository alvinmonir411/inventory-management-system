import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'routes' })
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('routes_code_unique', { unique: true })
  @Column({ type: 'varchar', length: 20 })
  code!: string;

  @Index('routes_name_unique', { unique: true })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Index('routes_is_active_idx')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
