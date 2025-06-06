// Always setup the environment first
import { env } from './env';

import fastify from 'fastify';
import fastifySensible from '@fastify/sensible';
import Automa, { verifyWebhook } from '@automa/bot';

import { update } from './update';

// Create client
export const automa = new Automa();

export const app = fastify({
  logger: true,
});

app.register(fastifySensible);

app.get('/health', async (request, reply) => {
  return reply.send();
});

app.post<{
  Body: {
    id: string;
    timestamp: string;
    data: {
      task: {
        id: number;
        token: string;
        title: string;
      };
    };
  };
}>('/automa', async (request, reply) => {
  const signature = request.headers['webhook-signature'] as string;

  // Verify request
  if (!verifyWebhook(env.AUTOMA.WEBHOOK_SECRET, signature, request.body)) {
    app.log.warn('Invalid signature');

    return reply.unauthorized();
  }

  const baseURL = request.headers['x-automa-server-host'] as string;

  // Download code
  const folder = await automa.code.download(request.body.data, { baseURL });

  try {
    // Main logic for updating the code. It takes
    // the folder location of the downloaded code
    // and updates it.
    //
    // **NOTE**: If this takes a long time, make
    // sure to return a response to the webhook
    // before starting the update process.
    await update(folder);

    // Propose code
    await automa.code.propose(
      {
        ...request.body.data,
        proposal: {
          title: 'We changed your code',
        },
      },
      {
        baseURL,
      },
    );
  } finally {
    // Clean up
    automa.code.cleanup(request.body.data);
  }

  return reply.send();
});

async function start() {
  try {
    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Only start the server if this file is the entrypoint
if (require.main === module) {
  start();
}
