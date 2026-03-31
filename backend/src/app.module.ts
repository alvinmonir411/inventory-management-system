import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfig } from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { getEnvFilePaths } from './config/env-files';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CompanyPaymentsModule } from './modules/company-payments/company-payments.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { DamagesModule } from './modules/damages/damages.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { ProductsModule } from './modules/products/products.module';
import { ReportsModule } from './modules/reports/reports.module';
import { RolesModule } from './modules/roles/roles.module';
import { RoutesModule } from './modules/routes/routes.module';
import { SalesModule } from './modules/sales/sales.module';
import { StockTransactionsModule } from './modules/stock-transactions/stock-transactions.module';
import { UnitsModule } from './modules/units/units.module';
import { UsersModule } from './modules/users/users.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [appConfig],
      envFilePath: getEnvFilePaths(process.env.NODE_ENV),
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    AuthModule,
    CategoriesModule,
    CollectionsModule,
    CompanyPaymentsModule,
    CompaniesModule,
    DamagesModule,
    ExpensesModule,
    HealthModule,
    PurchasesModule,
    ProductsModule,
    ReportsModule,
    RolesModule,
    RoutesModule,
    SalesModule,
    StockTransactionsModule,
    UnitsModule,
    UsersModule,
    WarehousesModule,
  ],
})
export class AppModule {}
