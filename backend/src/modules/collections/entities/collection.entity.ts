import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Route } from '../../routes/entities/route.entity';

const decimalTransformer = {
  to: (value: number): number => value,
  from: (value: string): number => Number(value),
};

@Entity({ name: 'collections' })
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('collections_collection_no_unique', { unique: true })
  @Column({ name: 'collection_no', type: 'varchar', length: 30 })
  collectionNo!: string;

  @ManyToOne(() => Route, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'route_id' })
  route!: Route;

  @Index('collections_collection_date_idx')
  @Column({ name: 'collection_date', type: 'date' })
  collectionDate!: string;

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
