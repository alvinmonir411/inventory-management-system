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

import { Route } from '../../routes/entities/route.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { SaleItem } from './sale-item.entity';

@Entity({ name: 'sales' })
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('sales_sale_no_unique', { unique: true })
  @Column({ name: 'sale_no', type: 'varchar', length: 30 })
  saleNo!: string;

  @Index('sales_sale_date_idx')
  @Column({ name: 'sale_date', type: 'date' })
  saleDate!: string;

  @ManyToOne(() => Route, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'route_id' })
  route!: Route;

  @ManyToOne(() => Warehouse, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse!: Warehouse;

  @OneToMany(() => SaleItem, (item) => item.sale)
  items!: SaleItem[];

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
