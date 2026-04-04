import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericColumnTransformer } from '../../../common/database/numeric.transformer';
import { Company } from '../../companies/entities/company.entity';
import { PurchaseItem } from './purchase-item.entity';
import { PurchasePayment } from './purchase-payment.entity';

@Entity({ name: 'purchases' })
@Index(['companyId', 'purchaseDate'])
@Index(['referenceNo'], { unique: true })
export class Purchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyId: number;

  @Column({ type: 'timestamptz' })
  purchaseDate: Date;

  @Column({ type: 'varchar', length: 60, nullable: true })
  referenceNo: string | null;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: numericColumnTransformer,
    default: 0,
  })
  paidAmount: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  payableAmount: number;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @OneToMany(() => PurchaseItem, (purchaseItem) => purchaseItem.purchase, {
    cascade: false,
  })
  items: PurchaseItem[];

  @OneToMany(
    () => PurchasePayment,
    (purchasePayment) => purchasePayment.purchase,
    {
      cascade: false,
    },
  )
  payments: PurchasePayment[];
}
