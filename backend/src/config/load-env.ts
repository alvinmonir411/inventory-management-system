import * as dotenv from 'dotenv';
import { existsSync } from 'node:fs';

import { getEnvFilePaths } from './env-files';

export const loadEnvFiles = (nodeEnv?: string): void => {
  const envPaths = getEnvFilePaths(nodeEnv);

  for (const envPath of envPaths.reverse()) {
    if (!existsSync(envPath)) {
      continue;
    }

    dotenv.config({
      path: envPath,
      override: false,
    });
  }
};
