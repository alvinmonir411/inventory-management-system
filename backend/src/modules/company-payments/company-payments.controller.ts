import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { CompanyPaymentsService } from './company-payments.service';
import { CreateCompanyPaymentDto } from './dto/create-company-payment.dto';
import { QueryCompanyPaymentsDto } from './dto/query-company-payments.dto';

@Controller('company-payments')
export class CompanyPaymentsController {
  constructor(private readonly companyPaymentsService: CompanyPaymentsService) {}

  @Post()
  create(@Body() createCompanyPaymentDto: CreateCompanyPaymentDto) {
    return this.companyPaymentsService.create(createCompanyPaymentDto);
  }

  @Get()
 findAll(@Query() queryCompanyPaymentsDto: QueryCompanyPaymentsDto) {
    return this.companyPaymentsService.findAll(queryCompanyPaymentsDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companyPaymentsService.findOne(id);
  }
}
