import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { Company } from '../../companies/entities/company.entity';
import { Unit } from '../../units/entities/unit.entity';

const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null =>
    value === null ? null : Number(value),
};

@Entity({ name: 'products' })
@Index('products_company_category_idx', ['company', 'category'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('products_code_unique', { unique: true })
  @Column({ type: 'varchar', length: 30 })
  code!: string;

  @Index('products_sku_unique', { unique: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  sku!: string | null;

  @Index('products_name_idx')
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({
    name: 'purchase_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  purchasePrice!: number;

  @Column({
    name: 'sale_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  salePrice!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  mrp!: number | null;

  @ManyToOne(() => Company, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @ManyToOne(() => Category, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => Unit, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'unit_id' })
  unit!: Unit;

  @Index('products_is_active_idx')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
