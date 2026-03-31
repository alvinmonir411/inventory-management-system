import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from '../categories/entities/category.entity';
import { Company } from '../companies/entities/company.entity';
import { Unit } from '../units/entities/unit.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Company, Category, Unit])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
