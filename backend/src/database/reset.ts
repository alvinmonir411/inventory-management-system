import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  process.env.DB_SYNCHRONIZE = 'true';
  process.env.DB_DROP_SCHEMA = 'true';
  process.env.DB_SEED_DEMO = process.env.DB_SEED_DEMO ?? 'true';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  Logger.warn(
    'Database reset completed. Existing schema was dropped, recreated, and demo seed may run if enabled.',
    'DatabaseReset',
  );

  await app.close();
}

void bootstrap();
