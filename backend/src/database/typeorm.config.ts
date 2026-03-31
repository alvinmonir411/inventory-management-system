import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';

type DatabaseConfig = {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  name?: string;
  ssl: boolean;
};

type RuntimeConfig = {
  nodeEnv: string;
  database: DatabaseConfig;
};

const buildBaseTypeOrmOptions = ({
  nodeEnv,
  database,
}: RuntimeConfig): DataSourceOptions => ({
  type: 'postgres',
  url: database.url,
  host: database.host,
  port: database.port,
  username: database.username,
  password: database.password,
  database: database.name,
  synchronize: false,
  logging: nodeEnv !== 'production',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ssl: database.ssl ? { rejectUnauthorized: false } : false,
});

export const buildTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    ...buildBaseTypeOrmOptions({
      nodeEnv: configService.getOrThrow<string>('nodeEnv'),
      database: {
        url: configService.get<string>('database.url'),
        host: configService.getOrThrow<string>('database.host'),
        port: configService.getOrThrow<number>('database.port'),
        username: configService.getOrThrow<string>('database.username'),
        password: configService.getOrThrow<string>('database.password'),
        name: configService.getOrThrow<string>('database.name'),
        ssl: configService.getOrThrow<boolean>('database.ssl'),
      },
    }),
    autoLoadEntities: false,
  };
};

export const buildDataSourceOptions = (
  runtimeConfig: RuntimeConfig,
): DataSourceOptions => buildBaseTypeOrmOptions(runtimeConfig);
