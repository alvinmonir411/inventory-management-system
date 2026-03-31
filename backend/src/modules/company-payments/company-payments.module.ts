import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from '../companies/entities/company.entity';
import { CompanyPayment } from './entities/company-payment.entity';
import { CompanyPaymentsController } from './company-payments.controller';
import { CompanyPaymentsService } from './company-payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyPayment, Company])],
  controllers: [CompanyPaymentsController],
  providers: [CompanyPaymentsService],
  exports: [CompanyPaymentsService, TypeOrmModule],
})
export class CompanyPaymentsModule {}
