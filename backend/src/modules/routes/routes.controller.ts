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

import { CreateRouteDto } from './dto/create-route.dto';
import { QueryRoutesDto } from './dto/query-routes.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  findAll(@Query() queryRoutesDto: QueryRoutesDto) {
    return this.routesService.findAll(queryRoutesDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRouteDto: UpdateRouteDto,
  ) {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.routesService.remove(id);
  }
}
