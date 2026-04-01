import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  process.env.DB_SYNCHRONIZE = 'true';
  process.env.DB_DROP_SCHEMA = 'true';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  Logger.warn(
    'Database reset completed. Existing schema was dropped and recreated without any demo data.',
    'DatabaseReset',
  );

  await app.close();
}

void bootstrap();
