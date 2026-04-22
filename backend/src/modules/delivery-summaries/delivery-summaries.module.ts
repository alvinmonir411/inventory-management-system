import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverySummariesController } from './delivery-summaries.controller';
import { DeliverySummariesService } from './delivery-summaries.service';
import { DeliverySummaryItem } from './entities/delivery-summary-item.entity';
import { DeliverySummary } from './entities/delivery-summary.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliverySummary, DeliverySummaryItem])],
  controllers: [DeliverySummariesController],
  providers: [DeliverySummariesService],
  exports: [DeliverySummariesService],
})
export class DeliverySummariesModule {}
