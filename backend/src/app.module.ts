import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DeliverySummariesModule } from './modules/delivery-summaries/delivery-summaries.module';
import { ProductsModule } from './modules/products/products.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { RoutesModule } from './modules/routes/routes.module';
import { SalesModule } from './modules/sales/sales.module';
import { ShopsModule } from './modules/shops/shops.module';
import { StockModule } from './modules/stock/stock.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    DatabaseModule,
    HealthModule,
    CompaniesModule,
    ProductsModule,
    PurchasesModule,
    RoutesModule,
    SalesModule,
    ShopsModule,
    StockModule,
    UsersModule,
    AuthModule,
    DeliverySummariesModule,
  ],
})
export class AppModule {}
