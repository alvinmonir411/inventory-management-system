import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Company } from '../../companies/entities/company.entity';

const decimalTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => Number(value),
};

@Entity({ name: 'company_payments' })
export class CompanyPayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('company_payments_payment_no_unique', { unique: true })
  @Column({ name: 'payment_no', type: 'varchar', length: 30 })
  paymentNo!: string;

  @ManyToOne(() => Company, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @Index('company_payments_payment_date_idx')
  @Column({ name: 'payment_date', type: 'date' })
  paymentDate!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  amount!: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 30, nullable: true })
  paymentMethod!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
