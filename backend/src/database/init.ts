import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  process.env.DB_SYNCHRONIZE = 'true';
  process.env.DB_DROP_SCHEMA = 'false';
  process.env.DB_SEED_DEMO = process.env.DB_SEED_DEMO ?? 'true';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  Logger.log(
    'Database initialization completed. Tables are synchronized and demo seed may run if data is empty.',
    'DatabaseInit',
  );

  await app.close();
}

void bootstrap();
