import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3001),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  JWT_SECRET: Joi.string().min(8).required(),
  FRONTEND_URL: Joi.string().uri().required(),
  DB_SYNCHRONIZE: Joi.string().valid('true', 'false').default('false'),
  DB_DROP_SCHEMA: Joi.string().valid('true', 'false').default('false'),
});
