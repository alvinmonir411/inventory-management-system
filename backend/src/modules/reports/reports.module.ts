import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Collection } from '../collections/entities/collection.entity';
import { Company } from '../companies/entities/company.entity';
import { CompanyPayment } from '../company-payments/entities/company-payment.entity';
import { Damage } from '../damages/entities/damage.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Product } from '../products/entities/product.entity';
import { PurchaseItem } from '../purchases/entities/purchase-item.entity';
import { Route } from '../routes/entities/route.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { StockTransaction } from '../stock-transactions/entities/stock-transaction.entity';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Collection,
      Company,
      CompanyPayment,
      Damage,
      Expense,
      Product,
      PurchaseItem,
      Route,
      SaleItem,
      StockTransaction,
    ]),
  ],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
