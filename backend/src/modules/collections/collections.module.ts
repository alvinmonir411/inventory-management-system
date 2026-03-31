import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Route } from '../routes/entities/route.entity';
import { Collection } from './entities/collection.entity';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Route])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService, TypeOrmModule],
})
export class CollectionsModule {}
