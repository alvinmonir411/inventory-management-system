const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const parsedUrl = new URL(databaseUrl);
    const sslMode = parsedUrl.searchParams.get('sslmode');
    const usesSsl = sslMode === 'require';

    return {
      url: databaseUrl,
      host: parsedUrl.hostname,
      port: Number(parsedUrl.port || 5432),
      username: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password),
      name: parsedUrl.pathname.replace(/^\//, ''),
      ssl: usesSsl,
    };
  }

  return {
    url: undefined,
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'dealer_erp',
    ssl: process.env.DB_SSL === 'true',
  };
};

export const appConfig = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  database: getDatabaseConfig(),
});
