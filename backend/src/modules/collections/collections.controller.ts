import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { QueryCollectionsDto } from './dto/query-collections.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @Get()
  findAll(@Query() queryCollectionsDto: QueryCollectionsDto) {
    return this.collectionsService.findAll(queryCollectionsDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.findOne(id);
  }
}
