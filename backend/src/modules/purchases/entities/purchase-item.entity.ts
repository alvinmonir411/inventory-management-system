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
import { numericColumnTransformer } from '../../../common/database/numeric.transformer';
import { Product } from '../../products/entities/product.entity';
import { Purchase } from './purchase.entity';

@Entity({ name: 'purchase_items' })
@Index(['purchaseId'])
@Index(['productId'])
export class PurchaseItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchaseId: number;

  @Column()
  productId: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 3,
    transformer: numericColumnTransformer,
  })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  unitCost: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  lineTotal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Purchase, (purchase) => purchase.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;

  @ManyToOne(() => Product, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
