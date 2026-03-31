import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryExpensesDto } from './dto/query-expenses.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  findAll(@Query() queryExpensesDto: QueryExpensesDto) {
    return this.expensesService.findAll(queryExpensesDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.expensesService.findOne(id);
  }
}
