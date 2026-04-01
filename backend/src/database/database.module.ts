import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoSeedService } from './seed/demo-seed.service';
import { typeOrmConfig } from './typeorm.config';

@Module({
  imports: [TypeOrmModule.forRootAsync(typeOrmConfig)],
  providers: [DemoSeedService],
})
export class DatabaseModule {}
