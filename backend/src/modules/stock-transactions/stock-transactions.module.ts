import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/entities/product.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { StockTransaction } from './entities/stock-transaction.entity';
import { StockTransactionsService } from './stock-transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockTransaction, Product, Warehouse])],
  providers: [StockTransactionsService],
  exports: [StockTransactionsService, TypeOrmModule],
})
export class StockTransactionsModule {}
