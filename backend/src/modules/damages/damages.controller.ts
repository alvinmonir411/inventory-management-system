import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { CreateDamageDto } from './dto/create-damage.dto';
import { QueryDamagesDto } from './dto/query-damages.dto';
import { DamagesService } from './damages.service';

@Controller('damages')
export class DamagesController {
  constructor(private readonly damagesService: DamagesService) {}

  @Post()
  create(@Body() createDamageDto: CreateDamageDto) {
    return this.damagesService.create(createDamageDto);
  }

  @Get()
  findAll(@Query() queryDamagesDto: QueryDamagesDto) {
    return this.damagesService.findAll(queryDamagesDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.damagesService.findOne(id);
  }
}
