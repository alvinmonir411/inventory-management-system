import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeliverySummariesService } from './delivery-summaries.service';
import { CreateDeliverySummaryDto } from './dto/create-delivery-summary.dto';
import { QueryDeliverySummariesDto } from './dto/query-delivery-summaries.dto';
import { UpdateDeliverySummaryDto } from './dto/update-delivery-summary.dto';

@UseGuards(JwtAuthGuard)
@Controller('delivery-summaries')
export class DeliverySummariesController {
  constructor(
    private readonly deliverySummariesService: DeliverySummariesService,
  ) {}

  @Post()
  create(@Body() createDto: CreateDeliverySummaryDto) {
    return this.deliverySummariesService.create(createDto);
  }

  @Get()
  findAll(@Query() query: QueryDeliverySummariesDto) {
    return this.deliverySummariesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deliverySummariesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDeliverySummaryDto,
  ) {
    return this.deliverySummariesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deliverySummariesService.remove(id);
  }
}
