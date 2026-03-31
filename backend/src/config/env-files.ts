export const getEnvFilePaths = (nodeEnv?: string): string[] => {
  const environment = nodeEnv ?? 'development';

  return [
    `.env.${environment}.local`,
    `.env.${environment}`,
    '.env.local',
    '.env',
  ];
};
