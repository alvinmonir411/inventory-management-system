import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import type { RoleName } from '../types/role-name.type';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('roles_name_unique', { unique: true })
  @Column({ type: 'varchar', length: 50 })
  name!: RoleName;

  @Column({ type: 'varchar', length: 150, nullable: true })
  description!: string | null;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
