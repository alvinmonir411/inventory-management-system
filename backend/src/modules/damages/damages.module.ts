import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/entities/product.entity';
import { StockTransactionsModule } from '../stock-transactions/stock-transactions.module';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { DamagesController } from './damages.controller';
import { DamagesService } from './damages.service';
import { Damage } from './entities/damage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Damage, Product, Warehouse]),
    StockTransactionsModule,
  ],
  controllers: [DamagesController],
  providers: [DamagesService],
  exports: [DamagesService, TypeOrmModule],
})
export class DamagesModule {}
