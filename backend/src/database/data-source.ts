import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { loadEnvFiles } from '../config/load-env';
import { validateEnv } from '../config/env.validation';
import { buildDataSourceOptions } from './typeorm.config';

loadEnvFiles(process.env.NODE_ENV);

const env = validateEnv(process.env);

export default new DataSource(
  buildDataSourceOptions({
    nodeEnv: env.NODE_ENV,
    database: {
      url: env.DATABASE_URL,
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      name: env.DB_NAME,
      ssl:
        env.DB_SSL ||
        (env.DATABASE_URL?.includes('sslmode=require') ?? false),
    },
  }),
);
