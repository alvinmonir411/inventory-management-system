import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'units' })
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('units_name_unique', { unique: true })
  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Index('units_symbol_unique', { unique: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  symbol!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
