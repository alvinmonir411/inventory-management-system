import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().trim().default('api'),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().trim().default('1d'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .optional(),
  DB_HOST: Joi.when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.string().hostname().optional(),
    otherwise: Joi.string().hostname().required(),
  }),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),
  DB_PASSWORD: Joi.when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.string().allow('').optional(),
    otherwise: Joi.string().allow('').required(),
  }),
  DB_NAME: Joi.when('DATABASE_URL', {
    is: Joi.exist(),
    then: Joi.string().optional(),
    otherwise: Joi.string().required(),
  }),
  DB_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
});

export type ValidatedEnv = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  API_PREFIX: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATABASE_URL?: string;
  DB_HOST?: string;
  DB_PORT: number;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_NAME?: string;
  DB_SSL: boolean;
};

export const validateEnv = (
  config: Record<string, unknown>,
): ValidatedEnv => {
  const { error, value } = envValidationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
    convert: true,
  });

  if (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }

  return value as ValidatedEnv;
};
