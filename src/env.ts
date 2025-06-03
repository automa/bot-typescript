import { dirname, join } from 'node:path';

import { Static, Type } from '@sinclair/typebox';
import envSchema from 'nested-env-schema';

export const environment = process.env.NODE_ENV || 'development';

const schema = Type.Object({
  AUTOMA: Type.Object({
    WEBHOOK_SECRET: Type.String({
      default: 'atma_whsec_bot-typescript',
    }),
  }),
  PORT: Type.Number({
    default: 3000,
  }),
});

type Schema = Static<typeof schema>;

export const env = envSchema<Schema>({
  schema,
  dotenv: {
    path: join(dirname(__dirname), '.env'),
  },
});
