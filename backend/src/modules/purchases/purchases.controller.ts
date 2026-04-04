import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchasesDto } from './dto/query-purchases.dto';
import { ReceivePurchasePaymentDto } from './dto/receive-purchase-payment.dto';
import { PurchasesService } from './purchases.service';

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @Get()
  findAll(@Query() query: QueryPurchasesDto) {
    return this.purchasesService.findAll(query);
  }

  @Get('summary/company-wise-payable')
  getCompanyWisePayableSummary(@Query() query: QueryPurchasesDto) {
    return this.purchasesService.getCompanyWisePayableSummary(query);
  }

  @Get('companies/:companyId/payable-ledger')
  getCompanyPayableLedger(
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.purchasesService.getCompanyPayableLedger(companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.purchasesService.findOne(id);
  }

  @Post(':id/payments')
  receivePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() receivePurchasePaymentDto: ReceivePurchasePaymentDto,
  ) {
    return this.purchasesService.receivePayment(id, receivePurchasePaymentDto);
  }
}
