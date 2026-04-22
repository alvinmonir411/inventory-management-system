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
import { Company } from '../../companies/entities/company.entity';
import { Route } from '../../routes/entities/route.entity';
import { DeliverySummaryItem } from './delivery-summary-item.entity';

@Entity({ name: 'delivery_summaries' })
@Index(['companyId', 'deliveryDate'])
@Index(['routeId', 'deliveryDate'])
export class DeliverySummary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  companyId: number | null;

  @Column({ nullable: true })
  routeId: number | null;

  @Column({ type: 'timestamptz' })
  deliveryDate: Date;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string; // PENDING, COMPLETED

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'companyId' })
  company: Company | null;

  @ManyToOne(() => Route, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'routeId' })
  route: Route | null;

  @OneToMany(() => DeliverySummaryItem, (item) => item.deliverySummary, {
    cascade: true,
  })
  items: DeliverySummaryItem[];
}
