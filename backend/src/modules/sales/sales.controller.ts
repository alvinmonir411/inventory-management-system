import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';
import { SalesSummaryQueryDto } from './dto/sales-summary-query.dto';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get()
  findAll(@Query() query: QuerySalesDto) {
    return this.salesService.findAll(query);
  }

  @Get('summary/today-sales')
  getTodaySalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.salesService.getTodaySalesSummary(query);
  }

  @Get('summary/today-profit')
  getTodayProfitSummary(@Query() query: SalesSummaryQueryDto) {
    return this.salesService.getTodayProfitSummary(query);
  }

  @Get('summary/monthly')
  getMonthlySalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.salesService.getMonthlySalesSummary(query);
  }

  @Get('summary/route-wise')
  getRouteWiseSalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.salesService.getRouteWiseSalesSummary(query);
  }

  @Get('summary/company-wise')
  getCompanyWiseSalesSummary(@Query() query: SalesSummaryQueryDto) {
    return this.salesService.getCompanyWiseSalesSummary(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salesService.findOne(id);
  }
}
