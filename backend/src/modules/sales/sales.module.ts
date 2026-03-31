import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/entities/product.entity';
import { Route } from '../routes/entities/route.entity';
import { StockTransactionsModule } from '../stock-transactions/stock-transactions.module';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, Route, Product, Warehouse]),
    StockTransactionsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService, TypeOrmModule],
})
export class SalesModule {}
