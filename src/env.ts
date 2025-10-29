import { dirname, join } from 'node:path';

import envSchema from 'nested-env-schema';
import { z } from 'zod';

export const environment = process.env.NODE_ENV || 'development';

const schema = z.object({
  AUTOMA: z.object({
    WEBHOOK_SECRET: z.string().default('atma_whsec_bot-typescript'),
  }),
  PORT: z.number().default(3000),
});

type Schema = z.infer<typeof schema>;

export const env = envSchema<Schema>({
  schema: z.toJSONSchema(schema),
  dotenv: {
    path: join(dirname(__dirname), '.env'),
  },
});
