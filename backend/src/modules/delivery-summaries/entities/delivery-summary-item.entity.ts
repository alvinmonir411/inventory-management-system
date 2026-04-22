import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { numericColumnTransformer } from '../../../common/database/numeric.transformer';
import { Product } from '../../products/entities/product.entity';
import { DeliverySummary } from './delivery-summary.entity';

@Entity({ name: 'delivery_summary_items' })
export class DeliverySummaryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  deliverySummaryId: number;

  @Column()
  productId: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    transformer: numericColumnTransformer,
  })
  orderQuantity: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    transformer: numericColumnTransformer,
    default: 0,
  })
  returnQuantity: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    transformer: numericColumnTransformer,
    default: 0,
  })
  saleQuantity: number; // calculated as orderQuantity - returnQuantity

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
    default: 0,
  })
  unitPrice: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: numericColumnTransformer,
    default: 0,
  })
  lineTotal: number; // calculated as saleQuantity * unitPrice

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @Column({ default: false })
  isFromOrder: boolean;

  @ManyToOne(() => DeliverySummary, (ds) => ds.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deliverySummaryId' })
  deliverySummary: DeliverySummary;

  @ManyToOne(() => Product, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
