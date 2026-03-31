import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { Purchase } from './purchase.entity';

const decimalTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => Number(value),
};

@Entity({ name: 'purchase_items' })
export class PurchaseItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchase_id' })
  purchase!: Purchase;

  @ManyToOne(() => Product, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    transformer: decimalTransformer,
  })
  quantity!: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  unitPrice!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
