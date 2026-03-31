import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

const decimalTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => Number(value),
};

@Entity({ name: 'damages' })
@Index('damages_product_date_idx', ['product', 'damageDate'])
@Index('damages_warehouse_date_idx', ['warehouse', 'damageDate'])
export class Damage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => Warehouse, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @Index('damages_damage_date_idx')
  @Column({ name: 'damage_date', type: 'date' })
  damageDate!: string;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    transformer: decimalTransformer,
  })
  quantity!: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  reason!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
