import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

const decimalTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => Number(value),
};

@Entity({ name: 'expenses' })
@Index('expenses_name_date_idx', ['name', 'expenseDate'])
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('expenses_expense_date_idx')
  @Column({ name: 'expense_date', type: 'date' })
  expenseDate!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
