import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchasesDto } from './dto/query-purchases.dto';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @Get()
  findAll(@Query() queryPurchasesDto: QueryPurchasesDto) {
    return this.purchasesService.findAll(queryPurchasesDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchasesService.findOne(id);
  }
}
