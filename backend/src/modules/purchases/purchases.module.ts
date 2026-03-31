import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from '../companies/entities/company.entity';
import { Product } from '../products/entities/product.entity';
import { StockTransactionsModule } from '../stock-transactions/stock-transactions.module';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { PurchaseItem } from './entities/purchase-item.entity';
import { Purchase } from './entities/purchase.entity';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Purchase, PurchaseItem, Company, Product, Warehouse]),
    StockTransactionsModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
  exports: [PurchasesService, TypeOrmModule],
})
export class PurchasesModule {}
