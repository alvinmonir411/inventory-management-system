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
import { Purchase } from './purchase.entity';

@Entity({ name: 'purchase_payments' })
@Index(['purchaseId'])
@Index(['paymentDate'])
export class PurchasePayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  purchaseId: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  amount: number;

  @Column({ type: 'timestamptz' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Purchase, (purchase) => purchase.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;
}
