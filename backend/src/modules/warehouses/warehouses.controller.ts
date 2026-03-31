import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { QueryWarehousesDto } from './dto/query-warehouses.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  findAll(@Query() queryWarehousesDto: QueryWarehousesDto) {
    return this.warehousesService.findAll(queryWarehousesDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.warehousesService.remove(id);
  }
}
