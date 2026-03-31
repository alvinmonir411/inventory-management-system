import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Company } from '../../companies/entities/company.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { PurchaseItem } from './purchase-item.entity';

@Entity({ name: 'purchases' })
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('purchases_purchase_no_unique', { unique: true })
  @Column({ name: 'purchase_no', type: 'varchar', length: 30 })
  purchaseNo!: string;

  @Column({ name: 'supplier_invoice_no', type: 'varchar', length: 50, nullable: true })
  supplierInvoiceNo!: string | null;

  @Index('purchases_purchase_date_idx')
  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate!: string;

  @ManyToOne(() => Company, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @ManyToOne(() => Warehouse, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @OneToMany(() => PurchaseItem, (item) => item.purchase)
  items!: PurchaseItem[];

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
