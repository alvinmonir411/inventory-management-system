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
import { StockTransactionType } from '../enums/stock-transaction-type.enum';

const quantityTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => Number(value),
};

@Entity({ name: 'stock_transactions' })
@Index('stock_transactions_product_warehouse_date_idx', [
  'product',
  'warehouse',
  'transactionDate',
])
export class StockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('stock_transactions_type_idx')
  @Column({
    type: 'enum',
    enum: StockTransactionType,
    enumName: 'stock_transaction_type_enum',
  })
  type!: StockTransactionType;

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

  @Index('stock_transactions_reference_module_idx')
  @Column({ name: 'reference_module', type: 'varchar', length: 50 })
  referenceModule!: string;

  @Index('stock_transactions_reference_id_idx')
  @Column({ name: 'reference_id', type: 'varchar', length: 100 })
  referenceId!: string;

  @Column({ name: 'reference_code', type: 'varchar', length: 100, nullable: true })
  referenceCode!: string | null;

  @Index('stock_transactions_transaction_date_idx')
  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate!: string;

  @Column({
    name: 'quantity_in',
    type: 'decimal',
    precision: 14,
    scale: 3,
    default: 0,
    transformer: quantityTransformer,
  })
  quantityIn!: number;

  @Column({
    name: 'quantity_out',
    type: 'decimal',
    precision: 14,
    scale: 3,
    default: 0,
    transformer: quantityTransformer,
  })
  quantityOut!: number;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
